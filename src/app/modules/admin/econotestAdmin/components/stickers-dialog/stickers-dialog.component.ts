import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StickersService } from 'src/app/services/stickers.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stickers-dialog',
  templateUrl: './stickers-dialog.component.html',
  styleUrls: ['./stickers-dialog.component.scss'],
})
export class StickersDialogComponent implements OnInit {
  title: string = '';
  description: string = '';
  thematic: string = '';
  image: string | null = null;
  thematicId: string = '';

  constructor(
    public dialogRef: MatDialogRef<StickersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private stickersService: StickersService,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore
  ) {
    this.thematicId = data.thematicId || '';
  }

  ngOnInit(): void {
    if (this.data && this.data.thematicId) {
      this.thematic = this.data.thematicId;
    }
  }

  handleImageUpload(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  async saveSticker(): Promise<void> {
    if (!this.title || !this.description || !this.thematic || !this.image) {
      console.error('Completa todos los campos antes de guardar.');
      return;
    }
    // Obtén el próximo número de sticker (último + 1)
    const nextStickerNumber = await this.getNextStickerNumber();

    // Genera un nombre de archivo único con la temática
    const stickerImageName = `cromo_${nextStickerNumber}_${this.thematicId}.png`;

    // Sube la imagen al Storage
    const storageRef = this.storage.ref(`images/${stickerImageName}`);

    storageRef.put(this.dataURItoBlob(this.image)).then(async () => {
      // Obtiene la URL de descarga de la imagen
      const imageUrl = await storageRef.getDownloadURL().toPromise();

      // Asigna el ID al sticker (por ejemplo, 'cromo_1')
      const stickerId = `cromo_${nextStickerNumber}`;

      // Guarda el sticker en la colección 'cards'
      this.firestore
        .collection(`thematics/${this.thematicId}/cards`)
        .doc(stickerId)
        .set({
          id: `cromo_${nextStickerNumber}`,
          title: this.title,
          description: this.description,
          thematicId: `${this.thematicId}`,
          image: {
            path: `//images/${stickerImageName}`,
            url: imageUrl,
          },
        })
        .then(() => {
          console.log('Sticker guardado con éxito.');
          // Puedes realizar acciones adicionales después de guardar
        })
        .catch((error) => {
          console.error('Error al guardar el sticker:', error);
        });
    });

    this.dialogRef.close(false);
  }

  private async getNextStickerNumber(): Promise<number> {
    // Obtén los stickers existentes
    const stickersSnapshot = await this.firestore
      .collection(`thematics/${this.thematicId}/cards`)
      .get()
      .toPromise();

    // Asegúrate de que stickersSnapshot no sea 'undefined' antes de recorrerlo
    if (stickersSnapshot) {
      // Encuentra el número máximo actual de los stickers
      let maxStickerNumber = 0;
      stickersSnapshot.forEach((doc) => {
        const stickerId = doc.id;
        const match = stickerId.match(/^cromo_(\d+)$/);
        if (match) {
          const currentNumber = +match[1];
          if (currentNumber > maxStickerNumber) {
            maxStickerNumber = currentNumber;
          }
        }
      });

      // Devuelve el próximo número
      return maxStickerNumber + 1;
    } else {
      // Manejar el caso en que stickersSnapshot sea 'undefined'
      console.error('No se pudo obtener la información de los stickers.');
      return 1; // Devolver un valor predeterminado o manejar según sea necesario
    }
  }

  private generateUniqueFileName(): string {
    const currentDate = new Date();
    return `sticker_${currentDate.getTime()}`;
  }

  private dataURItoBlob(dataURI: string): Blob {
    const base64Index = dataURI.indexOf('base64,') + 'base64,'.length;
    const base64Content = dataURI.substring(base64Index);

    const byteString = atob(base64Content);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], {
      type: dataURI.split(',')[0].split(':')[1].split(';')[0],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false); // Cierra el diálogo sin guardar
  }

  deleteImage(event: MouseEvent): void {
    // Evita que el evento de clic se propague a otros elementos
    event.stopPropagation();

    // Lógica para eliminar la imagen
    this.image = ''; // Limpiar la imagen cuando se hace clic en el ícono de eliminación
  }
}

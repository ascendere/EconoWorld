import { Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { ThematicsService } from 'src/app/services/thematics.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-thematic-dialog',
  templateUrl: './thematic-dialog.component.html',
  styleUrls: ['./thematic-dialog.component.scss'],
})
export class ThematicDialogComponent implements OnInit {
  thematicTitle: string = '';
  imageFile: File | null = null;
  imageUrl: string | null = null;
  thematicId: string | null = null;
  saveSuccess: boolean = false;
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ThematicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private thematicService: ThematicsService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.thematic) {
      const thematic = this.data.thematic;
      this.thematicId = thematic.id || null;
      this.thematicTitle = thematic.name || '';
      this.imageUrl = thematic.image?.url || (thematic.image && thematic.image[0] ? thematic.image[0].url : null) || '';
    }
  }

  closeForm() {
    this.dialogRef.close();
  }
  

  async saveThematic(): Promise<void> {
    if (!this.thematicTitle || this.loading || this.saveSuccess) {
      return;
    }

    try {
     
      this.loading = true;
    
      if (this.thematicId) {
        await this.updateThematic();
      } else {
        await this.createThematic();
    }
    // Espera antes de cerrar el diálogo para que el usuario vea el mensaje de éxito
    await this.delay(2000);

    // Actualiza saveSuccess después de completar la operación con éxito
    this.saveSuccess = true;
  

  } catch (error) {
    console.error('Error al guardar la temática:', error);
  } finally {
    // Después de la operación (ya sea éxito o error), desactiva loading y saving
    this.loading = false;

    // Restaura saveSuccess después de un tiempo
    this.resetSuccessMessage();

    // Emitir el evento solo si la operación fue exitosa

      this.dialogRef.close();

  }
}

// Método para esperar un tiempo específico
private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  resetSuccessMessage(): void {
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
    console.log('resetSuccessMessage - saveSuccess:', this.saveSuccess);
  }

  private async updateThematic(): Promise<void> {
    const imageFile = this.imageUrl ? this.dataURItoBlob(this.imageUrl) : null;

    if (imageFile && this.thematicId) {
      const thematicId = this.generateSafeId(this.thematicTitle);
      const imageNameWithExtension = `${thematicId}.png`;

      try {
        if (typeof this.imageUrl === 'string') {
          const storageRef = this.storage.ref(`images/${imageNameWithExtension}`);
          await storageRef.putString(this.imageUrl, 'data_url');

          const newImageUrl = await storageRef.getDownloadURL().toPromise();

          const thematicData = {
            id: thematicId,
            name: this.thematicTitle,
            image: { url: newImageUrl },
          };

          await this.thematicService.updateThematic(this.thematicId, thematicData);
        } else {
          console.error('La URL de la imagen no es válida.');
        }
      } catch (error) {
        console.error('Error al subir la nueva imagen:', error);
      }
    } else if (this.thematicId) {
      const thematicData = {
        name: this.thematicTitle,
      };

      await this.thematicService.updateThematic(this.thematicId, thematicData);
    }
  }

  handleImageUpload(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.imageFile = file; 
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  private async createThematic(): Promise<void> {
    //const imageFile = this.imageUrl ? this.dataURItoBlob(this.imageUrl) : null;

    if (this.imageFile) {
      const thematicId = this.generateSafeId(this.thematicTitle);
      const imageName = `${thematicId}.png`;

      const storageRef = this.storage.ref(`images/${imageName}`);
      const uploadTask = storageRef.put(this.imageFile);
      await uploadTask;
      const newImageUrl = await storageRef.getDownloadURL().toPromise();

      const thematicData = {
        id: thematicId,
        name: this.thematicTitle,
        image: { url: newImageUrl },
      };

      await this.thematicService.createThematicWithId(thematicId, thematicData);
    }
  }

  private removeAccentsAndSpaces(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
  }

  private generateSafeId(title: string): string {
    const cleanedTitle = this.removeAccentsAndSpaces(title.replace(/[^\w\s]/gi, ''));

    const safeId = cleanedTitle.toLowerCase();

    return safeId;
  }

  openEditThematicDialog(thematic: any): void {
    this.thematicId = thematic.id;
    this.thematicTitle = thematic.name;
    this.imageUrl = thematic.image?.url || (thematic.image && thematic.image[0] ? thematic.image[0].url : null);
  

    const dialogRef = this.dialog.open(ThematicDialogComponent, {
      width: '400px',
      data: { thematic },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(updatedThematic => {
      this.resetSuccessMessage();
    });
  }

  async deleteImage(): Promise<void> {
    try {
      if (!this.imageUrl) {
        console.error('La URL de la imagen no está disponible.');
        return;
      }

      if (!this.thematicId) {
        this.imageFile = null;
        this.imageUrl = null;
        return;
      }

      const storageRef = this.storage.refFromURL(this.imageUrl);
      await storageRef.delete();
      this.imageFile = null;
      this.imageUrl = null;
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }
  }

  private generateImageNameFromUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    try {
      const urlObj = new URL(imageUrl);
      const pathname = urlObj.pathname;
      const fileName = pathname.substring(1);

      return fileName;
    } catch (error) {
      console.error('Error al generar el nombre del archivo desde la URL:', error);
      return null;
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    try {
      const base64Index = dataURI.indexOf('base64,') + 'base64,'.length;
      const base64Content = dataURI.substring(base64Index);

      console.log('Base64 Content:', base64Content);

      const byteString = atob(base64Content);
      const byteArray = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }

      return new Blob([byteArray], { type: dataURI.split(',')[0].split(':')[1].split(';')[0] });
    } catch (error) {
      console.error('Error al convertir la URL de datos a Blob:', error);
      return new Blob();
    }
  }
}
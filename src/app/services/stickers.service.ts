import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError, finalize, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StickersService {
  private stickers: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  // Obtener cromos por ID de temática desde Firestore
  getStickersByThematicId(thematicId: string): Observable<any[]> {
    return this.firestore
      .collection(`thematics/${thematicId}/cards`)
      .valueChanges()
      .pipe(
        map((stickers: any[]) => stickers || []), // Devuelve un arreglo vacío si no hay cromos
        catchError((error) => {
          console.error('Error al obtener cromos desde Firestore:', error);
          return of([]);
        })
      );
  }

  createSticker(thematicId: string, sticker: any): Promise<any | null> {
    return this.firestore
      .collection(`thematics/${thematicId}/cards`)
      .add(sticker)
      .then(() => (sticker.success ? sticker : null))
      .catch(() => null);
  }

  async updateUserStickers(userId: string, newStickers: any[]): Promise<void> {
    const stickersRef = this.firestore
      .collection('users')
      .doc(userId)
      .collection('evaluations')
      .doc('stickers');

    return stickersRef.set({ stickers: newStickers }, { merge: true });
  }

  getUserStickers(userId: string): Observable<any[]> {
    return this.firestore
      .collection(`users/${userId}/evaluations`)
      .valueChanges()
      .pipe(
        map((documents: any[]) => {
          // Extraer y combinar stickersWon de todos los documentos
          const stickers = documents.flatMap((doc) =>
            doc.stickersWon ? doc.stickersWon : []
          );
          return stickers;
        }),
        catchError((error) => {
          console.error('Error al obtener los stickers:', error);
          return of([]);
        })
      );
  }

  async saveUserStickers(userId: string, stickersWon: any[]): Promise<void> {
    const stickersRef = this.firestore
      .collection('users')
      .doc(userId)
      .collection('evaluations')
      .doc('stickers');

    await stickersRef.set({ stickers: stickersWon }, { merge: true });
    console.log('Cromos ganados guardados correctamente:', stickersWon);
  }
}

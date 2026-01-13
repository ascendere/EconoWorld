import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { StorageService } from 'src/app/services/storage.service';

export interface Game {
  id?: string;
  name: string;
  category: string;
  instructions: string;
  embedCode: string;  
  imageUrl?: string | null;

  createdAt?: Timestamp | Date | FieldValue;
  updatedAt?: Timestamp | Date | FieldValue;
}

@Injectable({ providedIn: 'root' })
export class EconoplayAdminService {

  private collectionName = 'games';

  constructor(
    private firestore: AngularFirestore,
    private storage: StorageService
  ) {}

  async createGame(game: Game, image?: File) {
    try {
      console.log('🎮 Preparando juego...', game);

      if (image) {
        game.imageUrl = await this.storage.subirArchivo(image, 'games/images');
      }

      game.createdAt = new Date();

      Object.keys(game).forEach(key => {
        const value = game[key as keyof Game];
        if (value === '' || value === null || value === undefined) {
          delete game[key as keyof Game];
        }
      });

      return await this.firestore.collection(this.collectionName).add(game);

    } catch (error) {
      console.error('❌ Error al crear el juego:', error);
      throw error;
    }
  }

  getGames() {
    return this.firestore
      .collection<Game>(this.collectionName)
      .valueChanges({ idField: 'id' });
  }

  getGameById(id: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc<Game>(id)
      .valueChanges();
  }

  async updateGame(id: string, data: Partial<Game>, image?: File) {
    try {
      if (image) {
        data.imageUrl = await this.storage.subirArchivo(image, 'games/images');
      }

      return await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .update(data);

    } catch (err) {
      console.error('❌ Error actualizando juego:', err);
      throw err;
    }
  }

  deleteGame(id: string) {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({ providedIn: 'root' })
export class EconoPlayService {
  private collectionName = 'econoplay';

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  async uploadFile(file: File): Promise<string> {
    const filePath = `econoplay/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    await this.storage.upload(filePath, file);
    return await fileRef.getDownloadURL().toPromise();
  }

  addGame(data: any) {
    return this.firestore.collection(this.collectionName).add(data);
  }

  getGames() {
    return this.firestore.collection(this.collectionName).valueChanges({ idField: 'id' });
  }

  updateGame(id: string, data: any) {
    return this.firestore.collection(this.collectionName).doc(id).update(data);
  }

  deleteGame(id: string) {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}

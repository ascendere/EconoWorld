import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { Video } from './admin/econovideos-admin.service';

@Injectable({ providedIn: 'root' })
export class EconoVideosService {
  private collectionName = 'videos';

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  getPublicVideos(): Observable<Video[]> {
    return this.firestore
      .collection<Video>(this.collectionName, ref => ref.where('publicado', '==', true))
      .valueChanges({ idField: 'id' });
  }

  async uploadVideo(file: File): Promise<string> {
    const filePath = `videos/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    await this.storage.upload(filePath, file);
    return await fileRef.getDownloadURL().toPromise();
  }

  addVideo(data: any) {
    return this.firestore.collection(this.collectionName).add(data);
  }

  getVideos() {
    return this.firestore.collection(this.collectionName).valueChanges({ idField: 'id' });
  }

  updateVideo(id: string, data: any) {
    return this.firestore.collection(this.collectionName).doc(id).update(data);
  }

  deleteVideo(id: string) {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}

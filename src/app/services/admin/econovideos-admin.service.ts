import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { StorageService } from 'src/app/services/storage.service';

export interface Video {

  id?: string;
  title: string;
  category: string;
  description: string;
  author: string[];
  videoUrl?: {
    name: string;
    url: string;
  };
  thumbnailUrl?: string;
  createAt: Date;
}

@Injectable({ providedIn: 'root' })
export class EconovideosAdminService {

  private collectionName = 'videos';

  constructor(
    private firestore: AngularFirestore,
    private storage: StorageService
  ) { }

  async addVideo(video: Video, archivoVideo?: File) {
    try {
      console.log('🎥 Subiendo video...', video);

      if (archivoVideo) {
        const uploadedUrl = await this.storage.subirArchivo(archivoVideo, 'videos');

        video.videoUrl =
        {
          name: archivoVideo.name,
          url: uploadedUrl
        };

        console.log('✅ Video subido:', video.videoUrl);
      }

      const result = await this.firestore.collection(this.collectionName).add(video);
      console.log('✅ Video creado con ID:', result.id);

      return result;

    } catch (error) {
      console.error('❌ Error al subir video:', error);
      throw error;
    }
  }

  getVideoById(id: string) {
    return this.firestore
      .collection<Video>(this.collectionName)
      .doc(id)
      .valueChanges({ idField: 'id' });
  }

  getVideos() {
    return this.firestore
      .collection<Video>(this.collectionName)
      .valueChanges({ idField: 'id' });
  }

  updateVideo(id: string, data: Partial<Video>) {
    return this.firestore.collection(this.collectionName).doc(id).update(data);
  }

  deleteVideo(id: string) {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}

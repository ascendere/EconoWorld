import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

export interface Video {
  id?: string;
  title: string;
  description?: string;
  category: string;
  region?: string;
  videoUrl: string;
  thumbnail?: string;
  publicado: boolean;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EconoVideosService {

  private collectionName = 'videos';

  constructor(private firestore: AngularFirestore) {}

  /** 🔹 Obtener videos públicos */
  getPublicVideos(): Observable<Video[]> {
    return this.firestore
      .collection<Video>(this.collectionName, ref =>
        ref
          .where('publicado', '==', true)
          .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  /** 🔹 Obtener videos por categoría */
  getByCategory(category: string): Observable<Video[]> {
    return this.firestore
      .collection<Video>(this.collectionName, ref =>
        ref
          .where('publicado', '==', true)
          .where('category', '==', category)
      )
      .valueChanges({ idField: 'id' });
  }

  /** 🔹 Obtener categorías dinámicas */
  getCategories(): Observable<string[]> {
    return this.getPublicVideos().pipe(
      map(videos => Array.from(new Set(videos.map(v => v.category))))
    );
  }
}

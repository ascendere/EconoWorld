import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface News {
  id?: string;
  title: string;
  category: string;
  content: string;
  keywords?: string[];
  resource?: {
    name: string;
    url: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class EconoNewService {
  private collectionName = 'news';

  constructor(private firestore: AngularFirestore) { }

  getNews(): Observable<News[]> {
    return this.firestore
      .collection<News>('news', ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges({ idField: 'id' });
  }

  getFeaturedNews(): Observable<News[]> {
    return this.firestore
      .collection<News>(this.collectionName, ref => ref.where('featured', '==', true))
      .valueChanges({ idField: 'id' }) as Observable<News[]>;
  }

  getNewsById(id: string): Observable<News | undefined> {
    return this.firestore
      .collection(this.collectionName)
      .doc<News>(id)
      .valueChanges() as Observable<News | undefined>;
  }
}

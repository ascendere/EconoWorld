import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface News {
  id?: string;
  title: string;
  body: string;
  category: string;
  mediaUrl?: string;
  extraMediaUrl?: string;
  tags?: string | string[];
  featured?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EconoNewService {
  private collectionName = 'news';

  constructor(private firestore: AngularFirestore) {}

  addNews(news: News) {
    const data = {
      ...news,
      featured: news.featured ?? false
    };
    return this.firestore.collection(this.collectionName).add(data);
  }

  getNews(): Observable<News[]> {
  return this.firestore
    .collection<News>(this.collectionName)
    .valueChanges({ idField: 'id' }) as Observable<News[]>;
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

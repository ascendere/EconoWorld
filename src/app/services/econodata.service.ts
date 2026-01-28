import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface data {
  id?: string;
  title: string;
  category: string;
  accessUrl?: string;
  fileUrl?: string; // PDF
  image?: string;
  createdAt?: any;
  likes?: number;
  dislikes?: number;
  likedBy?: string[];
  dislikedBy?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EconodataService {

  private collectionName = 'data';

  constructor(private firestore: AngularFirestore) {}

  /** 🔹 Obtener todos los datasets */
  getAll(): Observable<data[]> {
    return this.firestore
      .collection<data>(this.collectionName, ref =>
        ref.orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  /** 🔹 Obtener dataset por ID */
  getById(id: string): Observable<data | undefined> {
    return this.firestore
      .collection<data>(this.collectionName)
      .doc(id)
      .valueChanges({ idField: 'id' });
  }

  /** 🔹 Obtener categorías dinámicas */
  getCategories(): Observable<string[]> {
    return this.getAll().pipe(
      map(data =>
        Array.from(new Set(data.map(d => d.category).filter(Boolean)))
      )
    );
  }

  /** 🔹 Obtener datasets por categoría */
  getByCategory(category: string): Observable<data[]> {
    return this.firestore
      .collection<data>(this.collectionName, ref =>
        ref.where('category', '==', category)
      )
      .valueChanges({ idField: 'id' });
  }

  updateDataReactions(dataId: string, data: any) {
    return this.firestore.collection('data').doc(dataId).update(data);
  }
}

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface Libro {
  id?: string;
  titulo: string;
  autor: string;
  descripcion?: string;
  portadaUrl?: string;
  archivoUrl?: string;
  nivelRecomendacion?: number;
  destacado?: boolean;
  publicado?: boolean;
  fechaPublicacion?: Date;
}

@Injectable({ providedIn: 'root' })
export class EconobookService {
  constructor(private firestore: AngularFirestore) {}

  addBook(book: Libro) {
    return this.firestore.collection('books').add(book);
  }

  getBooks(): Observable<Libro[]> {
    return this.firestore.collection('books').valueChanges({ idField: 'id' }) as Observable<Libro[]>;
  }

  getPublishedBooks(): Observable<Libro[]> {
    return this.firestore.collection('books', ref =>
      ref.where('publicado', '==', true)
    ).valueChanges({ idField: 'id' }) as Observable<Libro[]>;
  }

  getFeaturedBooks(): Observable<Libro[]> {
    return this.firestore.collection('books', ref =>
      ref.where('destacado', '==', true)
    ).valueChanges({ idField: 'id' }) as Observable<Libro[]>;
  }
}

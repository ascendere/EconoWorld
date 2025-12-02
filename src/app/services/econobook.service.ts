import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

// ✅ Interfaz Libro (campos en español para vista cliente)
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

// ✅ Interfaz Book (campos en inglés para admin - exportada para compatibilidad)
export interface Book {
  id?: string;
  title: string;
  authors: string[];
  description: string;
  coverUrl: string;
  publisher?: string;
  year?: string;
  pdfUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EconobookService {
  private collectionName = 'books';

  constructor(private firestore: AngularFirestore) {}

  // ✅ Obtener todos los libros (retorna Book para flexibilidad)
  getBooks(): Observable<Book[]> {
    return this.firestore.collection<Book>(this.collectionName)
      .valueChanges({ idField: 'id' }) as Observable<Book[]>;
  }

  // ✅ Obtener solo libros publicados (compatible con Libro)
  getPublishedBooks(): Observable<any[]> {
    return this.firestore.collection(this.collectionName, ref =>
      ref.where('publicado', '==', true)
    ).valueChanges({ idField: 'id' }) as Observable<any[]>;
  }

  // ✅ Obtener libros destacados (compatible con Libro)
  getFeaturedBooks(): Observable<any[]> {
    return this.firestore.collection(this.collectionName, ref =>
      ref.where('destacado', '==', true)
    ).valueChanges({ idField: 'id' }) as Observable<any[]>;
  }

  // ✅ Obtener libro por ID
  getBookById(id: string): Observable<Book | undefined> {
    return this.firestore.collection<Book>(this.collectionName)
      .doc(id)
      .valueChanges({ idField: 'id' });
  }
}
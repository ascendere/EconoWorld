import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Book {
  id?: string;
  title: string;
  authors: string[];
  description: string;
  coverUrl: string;
  pdfUrl: string;
  publisher?: string;
  year?: number;
  createdAt?: any;
  updatedAt?: string;
}

// 🆕 INTERFAZ PARA EDITORIALES
export interface Publisher {
  name: string;
  imageUrl: string;
  bookCount: number;
}

// 🆕 INTERFAZ PARA AUTORES
export interface Author {
  name: string;
  imageUrl: string;
  bookCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class EconobookService {

  private collectionName = 'books';

  constructor(private firestore: AngularFirestore) { }

  getBooks(): Observable<Book[]> {
    return this.firestore
      .collection<Book>(this.collectionName)
      .valueChanges({ idField: 'id' });
  }

  getPublishedBooks(): Observable<Book[]> {
    return this.getBooks();
  }

  getFeaturedBooks(): Observable<Book[]> {
    return this.firestore
      .collection<Book>(this.collectionName, ref =>
        ref.orderBy('createdAt', 'desc').limit(6)
      )
      .valueChanges({ idField: 'id' });
  }

  getBookById(id: string): Observable<Book | undefined> {
    return this.firestore
      .collection<Book>(this.collectionName)
      .doc(id)
      .valueChanges({ idField: 'id' });
  }

  // 🆕 MÉTODO PARA OBTENER EDITORIALES DESTACADAS
  getFeaturedPublishers(): Observable<Publisher[]> {
    return this.getBooks().pipe(
      map(books => {
        // Agrupar libros por editorial
        const publisherMap = new Map<string, number>();

        books.forEach(book => {
          if (book.publisher) {
            const count = publisherMap.get(book.publisher) || 0;
            publisherMap.set(book.publisher, count + 1);
          }
        });

        // Convertir a array de editoriales
        const publishers: Publisher[] = [];
        publisherMap.forEach((count, name) => {
          publishers.push({
            name: name,
            imageUrl: this.getPublisherImage(name),
            bookCount: count
          });
        });

        // Retornar top 3 editoriales con más libros
        return publishers.sort((a, b) => b.bookCount - a.bookCount).slice(0, 3);
      })
    );
  }

  // 🆕 MÉTODO AUXILIAR: Asignar imagen según editorial
  private getPublisherImage(publisherName: string): string {
    const imageMap: { [key: string]: string } = {
      'UTPL': 'assets/images/inversione.png',
      'Pearson': 'assets/images/dinero.png',
      'McGraw-Hill': 'assets/images/cambia.png',
      'Cengage': 'assets/images/dinero.png',
      'Oxford': 'assets/images/cambia.png'
    };

    // Si no encuentra la editorial, usa imagen por defecto
    return imageMap[publisherName] || 'assets/images/dinero.png';
  }

  // 🆕 MÉTODO PARA OBTENER AUTORES DESTACADOS
  getFeaturedAuthors(): Observable<Author[]> {
    return this.getBooks().pipe(
      map(books => {
        // Contar libros por autor
        const authorMap = new Map<string, number>();

        books.forEach(book => {
          book.authors.forEach(author => {
            const count = authorMap.get(author) || 0;
            authorMap.set(author, count + 1);
          });
        });

        // Convertir a array de autores
        const authors: Author[] = [];
        authorMap.forEach((count, name) => {
          authors.push({
            name: name,
            imageUrl: 'assets/images/persona.png',
            bookCount: count
          });
        });

        // Retornar top 4 autores con más libros
        return authors.sort((a, b) => b.bookCount - a.bookCount).slice(0, 4);
      })
    );
  }
}
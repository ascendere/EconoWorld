import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom } from 'rxjs';

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
export class EconobookAdminService {
  private collectionName = 'books';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  async addBook(book: Book, coverFile: File | null, pdfFile: File): Promise<void> {
    try {
      // 1. Generar ID único para el libro
      const bookId = this.firestore.createId();

      let coverUrl = '';

      // 2. Subir la portada solo si existe
      if (coverFile) {
        coverUrl = await this.uploadFile(
          coverFile,
          `books/${bookId}/cover_${Date.now()}_${coverFile.name}`
        );
      }

      // 3. Subir el PDF
      const pdfUrl = await this.uploadFile(
        pdfFile,
        `books/${bookId}/pdf_${Date.now()}_${pdfFile.name}`
      );

      // 4. Crear el documento en Firestore
      const bookData: Book = {
        ...book,
        id: bookId,
        coverUrl,
        pdfUrl,
        createdAt: new Date().toISOString()
      };

      await this.firestore.collection(this.collectionName).doc(bookId).set(bookData);

    } catch (error) {
      console.error('Error al agregar libro:', error);
      throw error;
    }
  }

  async getBooks(): Promise<Book[]> {
    return await firstValueFrom(
      this.firestore.collection<Book>(this.collectionName)
        .valueChanges({ idField: 'id' })
    );
  }

  async getBookById(id: string): Promise<Book> {
    try {
      const doc = await firstValueFrom(
        this.firestore.collection<Book>(this.collectionName)
          .doc(id)
          .valueChanges({ idField: 'id' })
      );

      if (!doc) {
        throw new Error('Libro no encontrado');
      }

      return doc;
    } catch (error) {
      console.error('Error al obtener libro:', error);
      throw error;
    }
  }

  async updateBook(
    id: string,
    book: Partial<Book>,
    coverFile?: File | null,
    pdfFile?: File | null
  ): Promise<void> {
    try {
      const updateData: any = { ...book };
      // Si hay un nuevo PDF, subirlo y actualizar URL
      if (pdfFile) {
        // Eliminar el PDF antiguo (opcional)
        const oldBook = await this.getBookById(id);
        if (oldBook.pdfUrl) {
          await this.deleteFileByUrl(oldBook.pdfUrl);
        }

        // Subir nuevo PDF
        const pdfUrl = await this.uploadFile(
          pdfFile,
          `books/${id}/pdf_${Date.now()}_${pdfFile.name}`
        );
        updateData.pdfUrl = pdfUrl;
      }

      // Agregar fecha de actualización
      updateData.updatedAt = new Date().toISOString();

      // Actualizar en Firestore
      await this.firestore.collection(this.collectionName).doc(id).update(updateData);

    } catch (error) {
      console.error('Error al actualizar libro:', error);
      throw error;
    }
  }

  async deleteBook(id: string): Promise<void> {
    try {
      // Obtener el libro para eliminar sus archivos
      const book = await this.getBookById(id);
      
      // Eliminar PDF
      if (book.pdfUrl) {
        await this.deleteFileByUrl(book.pdfUrl);
      }

      // Eliminar documento de Firestore
      await this.firestore.collection(this.collectionName).doc(id).delete();

    } catch (error) {
      console.error('Error al eliminar libro:', error);
      throw error;
    }
  }

  // MÉTODO AUXILIAR - Subir archivo a Firebase Storage
  private async uploadFile(file: File, path: string): Promise<string> {
    try {
      const ref = this.storage.ref(path);
      await ref.put(file);
      const url = await firstValueFrom(ref.getDownloadURL());
      return url;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }

  private async deleteFileByUrl(url: string): Promise<void> {
    try {
      const ref = this.storage.refFromURL(url);
      await ref.delete();
    } catch (error) {
      console.warn('No se pudo eliminar el archivo:', error);
      // No lanzamos error porque el archivo podría no existir
    }
  }
}
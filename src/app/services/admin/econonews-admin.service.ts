import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { StorageService } from 'src/app/services/storage.service';

export interface Noticia {
  id?: string;
  title: string;             
  category: string;           
  content: string;            
  keywords?: string[];       
  resources?: {               
    name: string;
    url: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class EcononewsAdminService {

  private collectionName = 'news';

  constructor(
    private firestore: AngularFirestore,
    private storage: StorageService
  ) { }

  async createNews(news: Noticia) {
    try {
      console.log('📰 Preparando noticia...', news);

      // Limpiar campos vacíos antes de guardar
      Object.keys(news).forEach(key => {
        const value = news[key as keyof Noticia];
        if (value === '' || value === null || value === undefined) {
          delete news[key as keyof Noticia];
        }
      });

      return await this.firestore.collection(this.collectionName).add(news);

    } catch (error) {
      console.error('❌ Error al crear la noticia:', error);
      throw error;
    }
  }

  getNews() {
    return this.firestore
      .collection<Noticia>(this.collectionName)
      .valueChanges({ idField: 'id' });
  }

  getNewsById(id: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc<Noticia>(id)
      .valueChanges();
  }

  async updateNews(id: string, data: Partial<Noticia>) {
  try {
    return await this.firestore
      .collection(this.collectionName)
      .doc(id)
      .update(data);

  } catch (e) {
    console.error("❌ Error actualizando noticia:", e);
    throw e;
  }
}

  deleteNews(id: string) {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}


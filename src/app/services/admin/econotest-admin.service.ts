import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface Thematic {
  id?: string;
  nombre: string;
  descripcion?: string;
  color?: string;
}

export interface Questionary {
  id?: string;
  titulo: string;
  descripcion?: string;
  tematicaId: string;
  preguntas: any[];
  publicado?: boolean;
  destacado?: boolean;
  creadoEn?: Date;
}

export interface Sticker {
  id?: string;
  nombre: string;
  imagenUrl?: string;
  descripcion?: string;
  nivel?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EconotestAdminService {
  constructor(private firestore: AngularFirestore) {}

  // ==============================
  // TEMÁTICAS
  // ==============================
  addThematic(thematic: Thematic) {
    return this.firestore.collection('thematics').add(thematic);
  }

  getThematics(): Observable<Thematic[]> {
    return this.firestore.collection('thematics').valueChanges({ idField: 'id' }) as Observable<Thematic[]>;
  }

  updateThematic(id: string, thematic: Partial<Thematic>) {
    return this.firestore.collection('thematics').doc(id).update(thematic);
  }

  deleteThematic(id: string) {
    return this.firestore.collection('thematics').doc(id).delete();
  }

  // ==============================
  // CUESTIONARIOS
  // ==============================
  addQuestionary(questionary: Questionary) {
    return this.firestore.collection('questionaries').add(questionary);
  }

  getQuestionaries(): Observable<Questionary[]> {
    return this.firestore.collection('questionaries').valueChanges({ idField: 'id' }) as Observable<Questionary[]>;
  }

  updateQuestionary(id: string, data: Partial<Questionary>) {
    return this.firestore.collection('questionaries').doc(id).update(data);
  }

  deleteQuestionary(id: string) {
    return this.firestore.collection('questionaries').doc(id).delete();
  }

  // ==============================
  // STICKERS
  // ==============================
  addSticker(sticker: Sticker) {
    return this.firestore.collection('stickers').add(sticker);
  }

  getStickers(): Observable<Sticker[]> {
    return this.firestore.collection('stickers').valueChanges({ idField: 'id' }) as Observable<Sticker[]>;
  }

  updateSticker(id: string, sticker: Partial<Sticker>) {
    return this.firestore.collection('stickers').doc(id).update(sticker);
  }

  deleteSticker(id: string) {
    return this.firestore.collection('stickers').doc(id).delete();
  }
}

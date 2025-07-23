// thematics.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThematicsService {

  constructor(private firestore: AngularFirestore) { }

  async createThematicWithId(thematicId: string, thematicData: any): Promise<void> {
    const thematicRef = this.firestore.collection('thematics').doc(thematicId);
    await thematicRef.set(thematicData);
  }

  createThematic(data: any): Promise<any | null> {
    // Ajustar la estructura de la imagen si es necesario
    if (data.image && data.image.url) {
      // La estructura ya es válida, no es necesario hacer cambios
      return this.firestore.collection('thematics').add(data)
        .then(() => data.success ? data : null)
        .catch(() => null);
    } else if (data.image && data.image.length > 0 && data.image[0].url) {
      // La estructura es más compleja, ajustarla
      return this.firestore.collection('thematics').add({ ...data, image: data.image[0] })
        .then(() => data.success ? data : null)
        .catch(() => null);
    } else {
      // Estructura desconocida, devolver como está
      return this.firestore.collection('thematics').add(data)
        .then(() => data.success ? data : null)
        .catch(() => null);
    }
  }


  getThematics(): Observable<any[]> {
    return this.firestore.collection('thematics').valueChanges().pipe(
      map(thematics => thematics.map(thematic => this.transformThematic(thematic)))
    );
  }

  private transformThematic(thematic: any): any {
    // Verificar la estructura de la imagen y ajustarla si es necesario
    if (thematic.image && thematic.image.url) {
      // La estructura ya es válida, no es necesario hacer cambios
      return thematic;
    } else if (thematic.image && thematic.image.length > 0 && thematic.image[0].url) {
      // La estructura es más compleja, ajustarla
      return { ...thematic, image: thematic.image[0] };
    } else {
      // Estructura desconocida, devolver como está
      return thematic;
    }
  }

  getThematicById(id: string): Observable<any> {
    return this.firestore.collection('thematics').doc(id).valueChanges();
  }

  getThematic(id: string): Observable<any> {
    return this.firestore.collection('thematics').doc(id).valueChanges();
  }

  updateThematic(id: string, data: any): Promise<void> {
    return this.firestore.collection('thematics').doc(id).update(data);
  }

  deleteThematic(thematicId: string): Promise<void> {
    const thematicRef = this.firestore.collection('thematics').doc(thematicId);
    return thematicRef.delete();
  }

}

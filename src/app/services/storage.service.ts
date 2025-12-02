import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { EconobookService } from './econobook.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = getStorage();

  constructor(private econobookService: EconobookService) {}

  /**
   * Sube un archivo a Firebase Storage y devuelve su URL pública.
   * @param file Archivo a subir
   * @param carpeta Carpeta dentro del storage (ej: 'portadas', 'pdfs', 'videos')
   */
  async subirArchivo(file: File, carpeta: string): Promise<string> {
    try {
      const nombreUnico = `${Date.now()}-${file.name}`;
      const ruta = `${carpeta}/${nombreUnico}`;
      const storageRef = ref(this.storage, ruta);

      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      return url;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Firebase Storage usando su URL.
   */
  async eliminarArchivo(url: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }
}

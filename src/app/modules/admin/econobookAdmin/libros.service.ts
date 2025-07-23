import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {
  private storage = getStorage(); // inicializa Firebase Storage

  constructor() {}

  /**
   * Sube un archivo a Firebase Storage y devuelve la URL pública
   * @param file Archivo a subir (portada o PDF)
   * @param carpeta Carpeta destino en el storage ('portadas' o 'pdfs')
   * @returns URL pública del archivo subido
   */
  async subirArchivo(file: File, carpeta: 'portadas' | 'pdfs'): Promise<string> {
    try {
      const nombreUnico = `${Date.now()}-${file.name}`;
      const ruta = `libros/${carpeta}/${nombreUnico}`;
      const storageRef = ref(this.storage, ruta);

      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      return url;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }
}

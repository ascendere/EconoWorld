import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom } from 'rxjs';

export interface Data {
    id?: string;
    title: string;
    category: string;
    fileUrl?: string | null;      
    accessUrl?: string | null;    
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

@Injectable({ providedIn: 'root' })
export class EconodataAdminService {

    private collectionName = 'data';

    constructor(
        private firestore: AngularFirestore,
        private storage: AngularFireStorage
    ) { }

    async addData(data: Data, file?: File | null): Promise<void> {
        try {
            const id = this.firestore.createId();

            let fileUrl: string | null = null;

            // Si hay archivo lo sube
            if (file) {
                fileUrl = await this.uploadFile(
                    file,
                    `data/${id}/file_${Date.now()}_${file.name}`
                );
            }

            const payload: Data = {
                ...data,
                id,
                fileUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await this.firestore.collection(this.collectionName).doc(id).set(payload);

        } catch (error) {
            console.error('Error al agregar datos:', error);
            throw error;
        }
    }

    async getAll(): Promise<Data[]> {
        return await firstValueFrom(
            this.firestore.collection<Data>(this.collectionName)
                .valueChanges({ idField: 'id' })
        );
    }

    async getById(id: string): Promise<Data> {
        try {
            const doc = await firstValueFrom(
                this.firestore.collection<Data>(this.collectionName)
                    .doc(id)
                    .valueChanges({ idField: 'id' })
            );

            if (!doc) throw new Error('Data no encontrada');
            return doc;

        } catch (error) {
            console.error('Error al obtener datos:', error);
            throw error;
        }
    }

    async updateData(
        id: string,
        data: Partial<Data>,
        newFile?: File | null
    ): Promise<void> {

        try {
            const updatePayload: any = { ...data };

            // Subir archivo nuevo si existe
            if (newFile) {
                const old = await this.getById(id);

                if (old.fileUrl) {
                    await this.deleteFileByUrl(old.fileUrl);
                }

                const newUrl = await this.uploadFile(
                    newFile,
                    `data/${id}/file_${Date.now()}_${newFile.name}`
                );

                updatePayload.fileUrl = newUrl;
            }

            updatePayload.updatedAt = new Date().toISOString();

            await this.firestore.collection(this.collectionName).doc(id).update(updatePayload);

        } catch (error) {
            console.error('Error al actualizar datos:', error);
            throw error;
        }
    }

    async deleteData(id: string): Promise<void> {
        try {
            const data = await this.getById(id);

            if (data.fileUrl) {
                await this.deleteFileByUrl(data.fileUrl);
            }

            await this.firestore.collection(this.collectionName).doc(id).delete();

        } catch (error) {
            console.error('Error al eliminar datos:', error);
            throw error;
        }
    }

    private async uploadFile(file: File, path: string): Promise<string> {
        try {
            const ref = this.storage.ref(path);
            await ref.put(file);
            return await firstValueFrom(ref.getDownloadURL());
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
        }
    }
}

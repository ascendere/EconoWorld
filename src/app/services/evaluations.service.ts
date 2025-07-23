import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EvaluationsService {
  constructor(private firestore: AngularFirestore) {}

  // Función para verificar si ha pasado 24 horas desde la última evaluación
  private shouldReset(lastEvaluationDate: any): boolean {
    if (!lastEvaluationDate) return true;
    
    const lastDate = new Date(lastEvaluationDate);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - lastDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600); // Convertir a horas
    
    // Reset si han pasado más de 24 horas
    return hoursDiff >= 24;
  }

  // Función para obtener la fecha actual en formato ISO
  private getCurrentDate(): string {
    return new Date().toISOString();
  }

  getQuizState(
    userId: string,
    thematicId: string,
    questionaryId: string
  ): Observable<any> {
    const docId = `${thematicId}_${questionaryId}`;
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('evaluations')
      .doc(docId)
      .valueChanges()
      .pipe(
        map((state) => {
          // Si no hay estado, devolver objeto vacío
          if (!state) return {};
          
          // Verificar si debe hacer reset (más de 24 horas)
          if (this.shouldReset(state['lastEvaluationDate'])) {
            console.log('Reset diario automático: Han pasado más de 24 horas');
            // Resetear automáticamente
            this.resetEvaluation(userId, thematicId, questionaryId);
            return { attempts: 0, stickersWon: [], lastEvaluationDate: this.getCurrentDate() };
          }
          
          return state;
        }),
        catchError((error) => {
          console.error('Error al obtener el estado del cuestionario:', error);
          return of({});
        })
      );
  }

  getMultipleQuizStates(
    userId: string,
    thematicId: string,
    questionaryIds: string[]
  ): Observable<any[]> {
    const states$ = questionaryIds.map((id) =>
      this.getQuizState(userId, thematicId, id).pipe(
        map((state) => ({
          ...state,
          questionaryId: id,
        }))
      )
    );

    return combineLatest(states$).pipe(
      catchError((error) => {
        console.error('Error al obtener estados de los cuestionarios:', error);
        return of([]);
      })
    );
  }

  async saveEvaluation(evaluationData: {
    userId: string;
    thematicId: string;
    questionaryId: string;
    attempts: number;
    stickersWon: any[];
  }): Promise<void> {
    const { userId, thematicId, questionaryId, attempts, stickersWon } =
      evaluationData;

    const docId = `${thematicId}_${questionaryId}`;

    await this.firestore
      .collection('users')
      .doc(userId)
      .collection('evaluations')
      .doc(docId)
      .set({ 
        attempts, 
        stickersWon, 
        lastEvaluationDate: this.getCurrentDate() 
      }, { merge: true });

    console.log(
      `Evaluación guardada correctamente (Intento ${attempts}):`,
      stickersWon
    );
  }

  // Función para resetear manualmente una evaluación
  async resetEvaluation(
    userId: string,
    thematicId: string,
    questionaryId: string
  ): Promise<void> {
    const docId = `${thematicId}_${questionaryId}`;

    await this.firestore
      .collection('users')
      .doc(userId)
      .collection('evaluations')
      .doc(docId)
      .set({ 
        attempts: 0, 
        lastEvaluationDate: this.getCurrentDate() 
      }, { merge: true }); // merge: true para no borrar stickersWon

    console.log(`Evaluación reseteada para: ${thematicId}_${questionaryId}`);
  }

  getAllAttempts(
    userId: string,
    thematicId: string,
    questionaryId: string
  ): Observable<any[]> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('evaluations', (ref) =>
        ref
          .where('thematicId', '==', thematicId)
          .where('questionaryId', '==', questionaryId)
      )
      .valueChanges()
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error al obtener intentos:', error);
          return of([]);
        })
      );
  }

  calculateStickers(
    level: 'easy' | 'medium' | 'hard',
    attempts: number,
    existingStickers: any[] = [],
    availableStickers: any[] = []
  ): any[] {
    existingStickers = Array.isArray(existingStickers) ? existingStickers : [];
    availableStickers = Array.isArray(availableStickers)
      ? availableStickers
      : [];

    if (availableStickers.length === 0) {
      console.warn('No hay cromos disponibles.');
      return existingStickers;
    }

    const stickersPerAttempt = { easy: 1, medium: 2, hard: 3 };

    // Filtrar cromos que aún no han sido ganados
    const newStickersPool = availableStickers.filter(
      (sticker) =>
        !existingStickers.some((existing) => existing.id === sticker.id)
    );

    if (newStickersPool.length === 0) {
      console.warn('No hay cromos nuevos disponibles.');
      return existingStickers;
    }

    // Seleccionar cromos para este intento según el nivel
    const earnedStickers = newStickersPool.slice(0, stickersPerAttempt[level]);

    console.log(`Intento ${attempts}: Cromos ganados:`, earnedStickers);

    return [...existingStickers, ...earnedStickers];
  }
}

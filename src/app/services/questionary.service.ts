import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, map, Observable, of, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionaryService {
  constructor(private firestore: AngularFirestore) { }

  // Obtener cuestionarios por ID de temática
  getQuestionariesByThematicId(id: string): Observable<any[]> {
    if (!id) {
      console.error('ID de temática no válido:', id);
      return of([]);
    }

    return this.firestore.collection(`${id}/questionaries`).valueChanges();
  }

  // Obtener cuestionarios para cliente
  getQuestionariesByThematicIdCient(id: string): Observable<any[]> {
    if (!id) {
      console.error('ID de temática no válido:', id);
      return of([]);
    }

    return this.firestore
      .collection(`thematics/${id}/questionaries`)
      .valueChanges();
  }

  // Agregar cuestionario
  async addQuestionary(
    thematicId: string,
    questionaryData: any
  ): Promise<void> {
    console.log('Adding questionary for thematicId:', thematicId);

    const nextQuestionaryNumber = await this.getNextQuestionaryNumber(
      thematicId
    );

    const questionaryRef = this.firestore
      .collection(`thematics/${thematicId}/questionaries`)
      .doc(`questionary_${nextQuestionaryNumber}`);

    await questionaryRef.set({
      ...questionaryData,
      id: `questionary_${nextQuestionaryNumber}`,
      level: questionaryData.level || 'easy', // Nivel del cuestionario, por defecto 'easy'
    });
  }

  // Obtener el próximo número de cuestionario
  private async getNextQuestionaryNumber(thematicId: string): Promise<number> {
    const questionariesSnapshot = await this.firestore
      .collection(`thematics/${thematicId}/questionaries`)
      .get()
      .toPromise();

    if (questionariesSnapshot) {
      let maxQuestionaryNumber = 0;
      questionariesSnapshot.forEach((doc) => {
        const questionaryId = doc.id;
        const match = questionaryId.match(/^questionary_(\d+)$/);
        if (match) {
          const currentNumber = +match[1];
          if (currentNumber > maxQuestionaryNumber) {
            maxQuestionaryNumber = currentNumber;
          }
        }
      });

      return maxQuestionaryNumber + 1;
    } else {
      console.error('No se pudo obtener la información de los cuestionarios.');
      return 1;
    }
  }

  // Agregar pregunta a un cuestionario
  async addQuestion(
    thematicId: string,
    questionaryId: string,
    questionData: any
  ): Promise<void> {
    const nextQuestionNumber = await this.getNextQuestionNumber(
      thematicId,
      questionaryId
    );

    const questionRef = this.firestore
      .collection(
        `thematics/${thematicId}/questionaries/${questionaryId}/questions`
      )
      .doc(`question_${nextQuestionNumber}`);

    await questionRef.set({
      ...questionData,
      id: `question_${nextQuestionNumber}`,
    });
  }

  // Obtener el próximo número de pregunta
  private async getNextQuestionNumber(
    thematicId: string,
    questionaryId: string
  ): Promise<number> {
    const questionsSnapshot = await this.firestore
      .collection(
        `thematics/${thematicId}/questionaries/${questionaryId}/questions`
      )
      .get()
      .toPromise();

    if (!questionsSnapshot) {
      console.error('No se pudo obtener la información de las preguntas.');
      return 1;
    }

    let maxQuestionNumber = 0;
    questionsSnapshot.forEach((doc) => {
      const questionId = doc.id;
      const match = questionId.match(/^question_(\d+)$/);
      if (match) {
        const currentNumber = +match[1];
        if (currentNumber > maxQuestionNumber) {
          maxQuestionNumber = currentNumber;
        }
      }
    });

    return maxQuestionNumber + 1;
  }

  // Obtener preguntas y respuestas
  getQuestionsAndAnswers(
    thematicId: string,
    questionaryId: string
  ): Observable<any[]> {
    const path = `thematics/${thematicId}/questionaries/${questionaryId}/questions`;

    return this.firestore
      .collection(path)
      .valueChanges()
      .pipe(
        map((questions: any[]) => {
          const validQuestions = questions.filter(
            (q) => q && q.title && q.answers && q.answers.length > 0
          );

          return validQuestions; // Sin límite de 4 preguntas
        }),
        catchError((error) => {
          console.error('Error al obtener preguntas:', error);
          return of([]);
        })
      );
  }


  // Obtener preguntas y opciones por ID de cuestionario
  getQuestionsAndOptionsByQuestionaryId(
    questionaryId: string
  ): Observable<any[]> {
    return this.firestore
      .collection(`questionaries/${questionaryId}/questions`)
      .valueChanges();
  }

  // Eliminar pregunta y sus respuestas
  deleteQuestionAndAnswers(
    thematicId: string,
    questionaryId: string,
    questionId: string
  ): void {
    const path = `thematics/${thematicId}/questionaries/${questionaryId}/questions`;

    this.firestore
      .collection(path)
      .doc(questionId)
      .delete()
      .then(() => {
        console.log('Pregunta eliminada con éxito');
        this.deleteAnswers(thematicId, questionaryId, questionId);
      })
      .catch((error) => console.error('Error al eliminar la pregunta:', error));
  }

  // Eliminar todas las respuestas asociadas a una pregunta
  private deleteAnswers(
    thematicId: string,
    questionaryId: string,
    questionId: string
  ): void {
    const answersPath = `thematics/${thematicId}/questionaries/${questionaryId}/questions/${questionId}/answers`;

    this.firestore
      .collection(answersPath)
      .get()
      .subscribe((snapshot) => {
        snapshot.docs.forEach((doc) => {
          doc.ref
            .delete()
            .then(() => console.log('Respuesta eliminada con éxito'));
        });
      });
  }

  // Eliminar un cuestionario
  async deleteQuestionary(
    thematicId: string,
    questionaryId: string
  ): Promise<void> {
    const path = `thematics/${thematicId}/questionaries`;

    await this.firestore.collection(path).doc(questionaryId).delete();
  }

  getQuestionariesByLevel(
    thematicId: string,
    level: 'easy' | 'medium' | 'hard'
  ): Observable<any[]> {
    return this.firestore
      .collection(`thematics/${thematicId}/questionaries`, (ref) =>
        ref.where('level', '==', level)
      )
      .valueChanges();
  }

  getQuestionaryLevel(
    thematicId: string,
    questionaryId: string
  ): Observable<'easy' | 'medium' | 'hard'> {
    const path = `thematics/${thematicId}/questionaries/${questionaryId}`;
    return this.firestore
      .doc(path)
      .valueChanges()
      .pipe(
        take(1),
        map((data: any) => data.level || 'easy') // Nivel predeterminado
      );
  }


  // Obtener preguntas y respuestas
  getQuestionsAndAnswers2(
    thematicId: string,
    questionaryId: string
  ): Observable<any[]> {
    const path = `thematics/${thematicId}/questionaries/${questionaryId}/questions`;

    return this.firestore
      .collection(path)
      .valueChanges()
      .pipe(
        map((questions: any[]) => {
          const validQuestions = questions.filter(
            (q) => q && q.title && q.answers && q.answers.length > 0
          );

          return validQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
        }),
        catchError((error) => {
          console.error('Error al obtener preguntas:', error);
          return of([]);
        })
      );
  }

}


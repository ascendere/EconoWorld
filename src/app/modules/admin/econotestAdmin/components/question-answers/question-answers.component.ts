import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionaryService } from 'src/app/services/questionary.service';

@Component({
  selector: 'app-question-answers',
  templateUrl: './question-answers.component.html',
  styleUrls: ['./question-answers.component.scss'],
})
export class QuestionAnswersComponent implements OnInit, OnDestroy {
  thematicId: string = '';
  questionaryId: string = '';
  questionsAndAnswers: any[] = [];
  editTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private questionaryService: QuestionaryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.thematicId = params.get('thematicId') ?? '';
      this.questionaryId = params.get('questionaryId') ?? '';

      this.loadQuestionsAndAnswers();
    });
  }

  ngOnDestroy(): void {
    // Limpia el temporizador al destruir el componente
    if (this.editTimeout) {
      clearTimeout(this.editTimeout);
    }
  }

  loadQuestionsAndAnswers(): void {
    this.questionaryService
      .getQuestionsAndAnswers(this.thematicId, this.questionaryId)
      .subscribe(
        (data) => {
          this.questionsAndAnswers = data;
        },
        (error) => {
          console.error('Error loading questions and answers:', error);
        }
      );
  }

  // Volver a Temáticas
  goToThematics(): void {
    this.router.navigate(['/admin/tematicas']);
  }

  deleteQuestion(questionIndex: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      const questionId = this.questionsAndAnswers[questionIndex].id;
      this.questionaryService.deleteQuestionAndAnswers(
        this.thematicId,
        this.questionaryId,
        questionId
      );
      // Actualiza la lista de preguntas y respuestas después de eliminar
      this.loadQuestionsAndAnswers();
    }
  }
  scrollLeft(): void {
    const container = document.querySelector('.scrollable-horizontal') as HTMLElement;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' }); // Desplaza hacia la izquierda
    }
  }
  
  scrollRight(): void {
    const container = document.querySelector('.scrollable-horizontal') as HTMLElement;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' }); // Desplaza hacia la derecha
    }
  }
  
}


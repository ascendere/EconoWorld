import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionaryService } from 'src/app/services/questionary.service';
import { EvaluationsService } from 'src/app/services/evaluations.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ThematicsService } from 'src/app/services/thematics.service';

@Component({
  selector: 'app-list-test',
  templateUrl: './list-test.component.html',
  styleUrls: ['./list-test.component.scss'],
})
export class ListTestComponent implements OnInit, OnDestroy {
  thematicId: string = '';
  thematicTitle: string = '';
  questionaries: any[] = [];
  userId = '';
  currentUser: any = null;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionaryService: QuestionaryService,
    private evaluationService: EvaluationsService,
    private authService: AuthService,
    private thematicService: ThematicsService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    this.thematicId = params.get('id') || ''; // Obtener el ID de la URL

    // Usamos el ID de la temática para cargar los datos de la temática (nombre)
    this.thematicService
      .getThematicById(this.thematicId)
      .subscribe((thematic) => {
        this.thematicTitle = thematic.name; // Asignar el nombre de la temática
      });

    this.loadQuestionaries();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadQuestionaries(): void {
    this.authService.currentUserObservable
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((user) => {
          if (user) {
            this.currentUser = user;
            this.userId = user.uid;
            return this.questionaryService.getQuestionariesByThematicIdCient(
              this.thematicId
            );
          } else {
            console.error('El usuario no está autenticado.');
            return of([]);
          }
        })
      )
      .subscribe((questionaries) => {
        this.questionaries = questionaries;
        this.updateButtonText();
      });
  }

  private updateButtonText(): void {
    if (!this.questionaries || !this.userId) return;

    const questionaryIds = this.questionaries.map((q) => q.id);

    this.evaluationService
      .getMultipleQuizStates(this.userId, this.thematicId, questionaryIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((quizStates) => {
        this.questionaries.forEach((questionary) => {
          const quizState = quizStates.find(
            (state) => state.questionaryId === questionary.id
          );
          const attempts = quizState?.attempts || 0;

          // Verificar si se hizo reset automático
          const lastEvaluationDate = quizState?.['lastEvaluationDate'];
          if (lastEvaluationDate) {
            const lastDate = new Date(lastEvaluationDate);
            const currentDate = new Date();
            const timeDiff = currentDate.getTime() - lastDate.getTime();
            const hoursDiff = timeDiff / (1000 * 3600);
            
            // Si han pasado más de 24 horas, mostrar como reseteado
            if (hoursDiff >= 24) {
              questionary.buttonText = 'Responder Preguntas (0/3 intentos)';
              questionary.buttonColor = 'bg-blue-500';
              questionary.isDisabled = false;
              return;
            }
          }

          if (attempts >= 3) {
            // Si ya se completaron los intentos
            questionary.buttonText = 'Finalizado';
            questionary.buttonColor = 'bg-green-500'; // Color verde
            questionary.isDisabled = true; // Botón deshabilitado
          } else {
            // Si aún no se completaron los intentos
            questionary.buttonText = `Responder Preguntas (${attempts}/3 intentos)`;
            questionary.buttonColor =
              attempts > 0 ? 'bg-yellow-500' : 'bg-blue-500'; // Amarillo para intentos realizados, azul para ninguno
            questionary.isDisabled = false; // Botón habilitado
          }
        });
      });
  }

  navigateToQuestionary(questionaryId: string): void {
    if (!this.currentUser) {
      console.error('El usuario no está autenticado.');
      return;
    }

    this.router.navigate([
      '/tematica',
      this.thematicId,
      'questionaries',
      questionaryId,
      'questions',
    ]);
  }
}

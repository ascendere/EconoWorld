import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionaryService } from 'src/app/services/questionary.service';
import { StickersService } from 'src/app/services/stickers.service';
import { EvaluationsService } from 'src/app/services/evaluations.service';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss'],
})
export class EvaluationsComponent implements OnInit, OnDestroy {
  idThematic!: string;
  idQuestionary!: string;
  questions: any[] = [];
  currentQuestionIndex = 0;
  totalQuestions = 0;
  selectedOption: any[] = [];
  currentUser: any = null;
  availableStickers: any[] = [];
  stickersWon: any[] = [];
  correctAnswers: number = 0;
  attempts = 0;
  currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  isFinalized: boolean = false;
  timerInterval: any;
  isTimeUp: boolean = false;
  totalTimeSpent: number = 0;
  timeLeftPerQuestion: number[] = [];

  quizFinished = false;
  incorrectAnswers = 0;
  earnedStickers = 0;
  answered: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionaryService: QuestionaryService,
    private stickersService: StickersService,
    private evaluationService: EvaluationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.idThematic = params.get('id') || '';
      this.idQuestionary = params.get('questionaryId') || '';

      if (this.idThematic && this.idQuestionary) {
        this.authService.currentUserObservable
          .pipe(take(1))
          .subscribe((user) => {
            if (user) {
              this.currentUser = user;

              this.questionaryService
                .getQuestionsAndAnswers2(this.idThematic, this.idQuestionary)
                .pipe(take(1))
                .subscribe((questions) => {
                  this.questions = questions;
                  this.totalQuestions = this.questions.length;
                  this.selectedOption = new Array(this.totalQuestions).fill(null);
                  this.timeLeftPerQuestion = new Array(this.totalQuestions).fill(60);
                  this.answered = new Array(this.totalQuestions).fill(false);
                  this.startTimer();
                });

              this.questionaryService
                .getQuestionaryLevel(this.idThematic, this.idQuestionary)
                .pipe(take(1))
                .subscribe((level) => {
                  this.currentLevel = level;
                });

              this.stickersService
                .getStickersByThematicId(this.idThematic)
                .pipe(take(1))
                .subscribe((stickers) => {
                  this.availableStickers = stickers;
                });

              this.evaluationService
                .getQuizState(user.uid, this.idThematic, this.idQuestionary)
                .pipe(take(1))
                .subscribe((quizState) => {
                  this.attempts = quizState?.attempts || 0;
                  this.stickersWon = quizState?.stickersWon || [];
                  
                  // Verificar si se hizo reset automático
                  const lastEvaluationDate = quizState?.['lastEvaluationDate'];
                  if (lastEvaluationDate) {
                    const lastDate = new Date(lastEvaluationDate);
                    const currentDate = new Date();
                    const timeDiff = currentDate.getTime() - lastDate.getTime();
                    const hoursDiff = timeDiff / (1000 * 3600);
                    
                    // Si han pasado más de 24 horas, mostrar mensaje de reset
                    if (hoursDiff >= 24) {
                      alert('🔄 ¡Bienvenido! Las preguntas se han reseteado automáticamente. ¡Puedes volver a intentar!');
                    }
                  }
                });
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  validateAnswer(): void {
    // Ya no se suma aquí, el conteo se hace en showResults
  }

  enviarRespuesta(): void {
    if (!this.answered[this.currentQuestionIndex]) {
      const currentQuestion = this.questions[this.currentQuestionIndex];
      const selected = this.selectedOption[this.currentQuestionIndex];
      if (selected && selected.isCorrect) {
        this.correctAnswers++;
      }
      this.answered[this.currentQuestionIndex] = true;
    }
  }

  resetQuiz(): void {
    this.correctAnswers = 0;
    this.currentQuestionIndex = 0;
    this.selectedOption.fill(null);
    this.totalTimeSpent = 0;
    this.timeLeftPerQuestion = new Array(this.totalQuestions).fill(60);
    this.answered = new Array(this.totalQuestions).fill(false);
    this.startTimer();
  }

  startTimer(): void {
    this.isTimeUp = false;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.timeLeftPerQuestion[this.currentQuestionIndex] > 0) {
        this.timeLeftPerQuestion[this.currentQuestionIndex]--;
        this.totalTimeSpent++;
      } else {
        this.selectedOption[this.currentQuestionIndex] = { isCorrect: false };
        this.isTimeUp = true;
        this.nextQuestion();
      }
    }, 1000);
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    } else {
      this.showResults();
    }
  }

  timeUp(): void {
    this.isTimeUp = true;
    this.showResults();
  }

  showResults(): void {
    // Calcular respuestas correctas al final
    this.correctAnswers = this.questions.reduce((acc, question, idx) => {
      const selected = this.selectedOption[idx];
      return acc + (selected && selected.isCorrect ? 1 : 0);
    }, 0);

    const newAttempts = this.attempts + 1;
    const incorrect = this.totalQuestions - this.correctAnswers;
    this.incorrectAnswers = incorrect;

    // Lógica de cromos: 2 si todas correctas, 1 si 2 o 3 correctas, 0 si menos de 2
    let baseEarned = 0;
    if (this.correctAnswers === this.totalQuestions) {
      baseEarned = 2;
    } else if (this.correctAnswers >= 2) {
      baseEarned = 1;
    } else {
      baseEarned = 0;
    }

    const availableNotWon = this.availableStickers
      .filter(sticker => !this.stickersWon.some(s => s.id === sticker.id));

    let cromosMsg = '';
    if (this.availableStickers.length === 0) {
      cromosMsg = 'No hay cromos disponibles para esta temática.';
    } else if (availableNotWon.length === 0) {
      cromosMsg = 'Ya tienes todos los cromos disponibles para esta temática.';
    }

    // Seleccionar cromos nuevos para este intento (sin duplicados)
    const shuffled = availableNotWon.sort(() => 0.5 - Math.random());
    const newEarnedStickers = shuffled.slice(0, baseEarned);

    // Evitar duplicados en updatedStickers
    const updatedStickers = [
      ...this.stickersWon,
      ...newEarnedStickers.filter(
        sticker => !this.stickersWon.some(s => s.id === sticker.id)
      ).map(sticker => ({
        ...sticker,
        thematicId: this.idThematic
      }))
    ];

    this.earnedStickers = newEarnedStickers.length;
    this.quizFinished = true;

    alert(
      `\u2714 Test finalizado!\n` +
      `Correctas: ${this.correctAnswers}\n` +
      `Incorrectas: ${this.incorrectAnswers}\n` +
      `Tiempo total: ${this.totalTimeSpent} segundos\n` +
      `Cromos ganados: ${this.earnedStickers}` +
      (cromosMsg ? `\n${cromosMsg}` : '')
    );

    setTimeout(() => {
      this.router.navigate([`/tematica/list-test/${this.idThematic}`]);
    }, 3000);

    this.evaluationService
      .saveEvaluation({
        userId: this.currentUser.uid,
        thematicId: this.idThematic,
        questionaryId: this.idQuestionary,
        attempts: newAttempts,
        stickersWon: updatedStickers,
      })
      .then(() => {
        this.stickersWon = updatedStickers;
        this.attempts = newAttempts;
      })
      .catch((error) => {
        console.error('Error al guardar la evaluación:', error);
      });
  }

  get formattedTime(): string {
    const timeLeft = this.timeLeftPerQuestion[this.currentQuestionIndex] || 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  getCurrentCorrectAnswers(): number {
    // Ahora solo retorna correctAnswers, que solo se incrementa en enviarRespuesta
    return this.correctAnswers;
  }
}
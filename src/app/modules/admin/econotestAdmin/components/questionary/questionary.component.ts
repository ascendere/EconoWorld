// admin/questionary/questionary.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThematicsService } from 'src/app/services/thematics.service';
import { QuestionaryService } from 'src/app/services/questionary.service';
import { QuestionaryDialogComponent } from '../questionary-dialog/questionary-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from '../question-dialog/question-dialog.component';
import { QuestionAnswersComponent } from '../question-answers/question-answers.component';

@Component({
  selector: 'app-questionary',
  templateUrl: './questionary.component.html',
  styleUrls: ['./questionary.component.scss'],
})
export class QuestionaryComponent implements OnInit {
  thematicId: string = '';
  thematicName: string | null = null;
  questionary: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private thematicsService: ThematicsService,
    private questionaryService: QuestionaryService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  // questionary.component.ts

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      console.log('Todos los parámetros de la ruta:', params.keys);

      this.thematicId = params.get('tematicId') ?? '';
      console.log('Thematic ID en ngOnInit:', this.thematicId);

      if (this.thematicId) {
        this.loadThematicName();
      } else {
        console.error('ID de temática no válido:', this.thematicId);
      }
    });
  }

  loadThematicName(): void {
    if (!this.thematicId) {
      console.error('ID de temática no válido:', this.thematicId);
      return;
    }

    this.thematicsService.getThematic(this.thematicId).subscribe(
      (thematic) => {
        this.thematicName = thematic.name;
        this.loadQuestionarys();
      },
      (error) => {
        console.error('Error al cargar el nombre de la temática:', error);
      }
    );
  }

  loadQuestionarys(): void {
    console.log('Thematic ID:', this.thematicId);

    // Asegúrate de que la ID de la temática tenga el formato correcto
    const formattedThematicId = `thematics/${this.thematicId}`;

    this.questionaryService
      .getQuestionariesByThematicId(formattedThematicId)
      .subscribe(
        (data) => {
          this.questionary = data;
          console.log('Cuestionarios cargados:', this.questionary);
        },
        (error) => {
          console.error('Error al cargar los cuestionarios:', error);
        }
      );
  }

  openAddQuestionaryDialog(): void {
    const dialogRef = this.dialog.open(QuestionaryDialogComponent, {
      width: '400px',
      data: { thematicId: this.thematicId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Puedes realizar acciones después de que se cierra el diálogo
      // Por ejemplo, recargar la lista de stickers.
      this.loadQuestionarys();
    });
  }

  openAddQuestionDialog(questionaryId: string): void {
    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      width: '400px',
      data: { thematicId: this.thematicId, questionaryId: questionaryId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Puedes realizar acciones después de que se cierra el diálogo
      // Por ejemplo, recargar la lista de cuestionarios.
      this.loadQuestionarys();
    });
  }

  viewQuestionsAndAnswers(questionaryId: string): void {
    console.log('Thematic ID:', this.thematicId);
    console.log('Questionary ID:', questionaryId);
  
    // Luego navegas a la pantalla de preguntas
    this.router.navigate([
      '/admin/question-answers',
      this.thematicId,
      questionaryId,
    ]);
  }
  

  // Eliminar cuestionario
  deleteQuestionary(thematicId: string, questionaryId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cuestionario?')) {
      this.questionaryService
        .deleteQuestionary(thematicId, questionaryId)
        .then(() => {
          console.log('Cuestionario eliminado con éxito');
          this.loadQuestionarys(); // Recargar la lista de cuestionarios después de eliminar
        })
        .catch((error) => {
          console.error('Error al eliminar el cuestionario:', error);
        });
    }
  }

  getQuestionariesByLevel(level: 'easy' | 'medium' | 'hard'): any[] {
    return this.questionary.filter((q) => q.level === level);
  }
}

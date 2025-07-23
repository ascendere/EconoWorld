import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuestionaryService } from 'src/app/services/questionary.service';

@Component({
  selector: 'app-questionary-dialog',
  templateUrl: './questionary-dialog.component.html',
  styleUrls: ['./questionary-dialog.component.scss'],
})
export class QuestionaryDialogComponent {
  title: string = '';
  description: string = '';
  level: 'easy' | 'medium' | 'hard' = 'easy'; // Nivel predeterminado

  constructor(
    public dialogRef: MatDialogRef<QuestionaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private questionaryService: QuestionaryService
  ) {}

  saveQuestionary(): void {
    if (!this.title || !this.description || !this.level) {
      console.error('Completa todos los campos antes de guardar.');
      return;
    }

    const questionaryData = {
      title: this.title,
      description: this.description,
      level: this.level,
    };

    this.questionaryService
      .addQuestionary(this.data.thematicId, questionaryData)
      .then(() => {
        console.log('Cuestionario creado con éxito.');
        this.dialogRef.close();
      })
      .catch((error) => {
        console.error('Error al crear el cuestionario:', error);
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

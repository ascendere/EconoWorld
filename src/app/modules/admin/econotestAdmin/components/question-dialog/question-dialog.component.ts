import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { QuestionaryService } from 'src/app/services/questionary.service';

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
})
export class QuestionDialogComponent {
  questionForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private questionaryService: QuestionaryService
  ) {
    console.log('Received questionaryId:', data.questionaryId);
    this.initializeForm();
  }

  private initializeForm(): void {
    this.questionForm = this.formBuilder.group({
      questionTitle: ['', Validators.required],
      answers: this.formBuilder.array([]),
    });
    // Agregar una respuesta vacía al inicio
    this.addAnswer();
  }

  private createAnswer(): FormGroup {
    return this.formBuilder.group({
      text: ['', Validators.required],
      correct: false,
    });
  }

  get answers(): AbstractControl[] {
    return (this.questionForm.get('answers') as FormArray).controls;
  }

  addAnswer(): void {
    (this.questionForm.get('answers') as FormArray).push(this.createAnswer());
  }

  removeAnswer(index: number): void {
    (this.questionForm.get('answers') as FormArray).removeAt(index);
  }

  saveQuestion(): void {
    const formData = this.questionForm.value;

    if (
      !formData.questionTitle ||
      !formData.answers ||
      formData.answers.length === 0
    ) {
      console.error('Completa todos los campos antes de guardar la pregunta.');
      return;
    }

    // Verifica que al menos una respuesta sea correcta
    const hasCorrectAnswer = formData.answers.some(
      (answer: any) => answer.correct
    );
    if (!hasCorrectAnswer) {
      console.error('Selecciona al menos una respuesta correcta.');
      return;
    }

    // Datos de la pregunta
    const questionData = {
      title: formData.questionTitle,
      answers: formData.answers.map((answer: any) => ({
        isCorrect: answer.correct,
        title: answer.text,
      })),
    };

    // Obtén el ID del cuestionario desde los datos
    const questionaryId = this.data.questionaryId;

    // Guardar la pregunta en Firebase
    this.questionaryService
      .addQuestion(this.data.thematicId, questionaryId, questionData)
      .then(() => {
        console.log('Pregunta guardada con éxito.');
        this.dialogRef.close(); // Cierra el diálogo después de guardar
      })
      .catch((error) => {
        console.error('Error al guardar la pregunta:', error);
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

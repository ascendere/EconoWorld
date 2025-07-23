// src/app/modules/admin/econotestAdmin/econotest.admin.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EconotestRoutingModule } from './econotest-routing.admin';

import { QuestionaryComponent } from './components/questionary/questionary.component';
import { QuestionaryDialogComponent } from './components/questionary-dialog/questionary-dialog.component';
import { QuestionDialogComponent } from './components/question-dialog/question-dialog.component';
import { QuestionAnswersComponent } from './components/question-answers/question-answers.component';
import { StickersComponent } from './components/stickers/stickers.component';
import { StickersDialogComponent } from './components/stickers-dialog/stickers-dialog.component';
import { ThematicsComponent } from './components/thematics/thematics.component';
import { ThematicDialogComponent } from './components/thematic-dialog/thematic-dialog.component';

@NgModule({
  declarations: [
    QuestionaryComponent,
    QuestionaryDialogComponent,
    QuestionDialogComponent,
    QuestionAnswersComponent,
    StickersComponent,
    StickersDialogComponent,
    ThematicsComponent,
    ThematicDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EconotestRoutingModule
  ]
})
export class EconotestModule {}

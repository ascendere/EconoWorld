// src/app/modules/admin/econotestAdmin/econotest-routing.admin.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionaryComponent } from './components/questionary/questionary.component';
import { QuestionDialogComponent } from './components/question-dialog/question-dialog.component';
import { QuestionAnswersComponent } from './components/question-answers/question-answers.component';
import { StickersComponent } from './components/stickers/stickers.component';
import { ThematicsComponent } from './components/thematics/thematics.component';

const routes: Routes = [
  { path: 'cuestionarios', component: QuestionaryComponent },
  { path: 'preguntas', component: QuestionDialogComponent },
  { path: 'respuestas', component: QuestionAnswersComponent },
  { path: 'stickers', component: StickersComponent },
  { path: 'tematicas', component: ThematicsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EconotestRoutingModule {}

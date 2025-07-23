import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importar los componentes de las vistas de administración
import { ThematicsComponent } from './econotestAdmin/components/thematics/thematics.component';
import { EconobookAdminComponent } from './econobookAdmin/econobok.component.admin';
import { ThematicDialogComponent } from './econotestAdmin/components/thematic-dialog/thematic-dialog.component';
import { StickersComponent } from './econotestAdmin/components/stickers/stickers.component';
import { QuestionaryComponent } from './econotestAdmin/components/questionary/questionary.component';
import { QuestionAnswersComponent } from './econotestAdmin/components/question-answers/question-answers.component';
import { AuthGuard } from 'src/app/services/guards/auth.guard';
import { EcononewsAdminComponent } from './econonewsAdmin/econonews-admin.component';
import { EconopleyAdminComponent } from './econopleyAdmin/econopley-admin.component';
import { EconovidiosAdminComponent } from './econovidiosAdmin/econovidios-admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  {
    path: 'tematicas',
    component: ThematicsComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  {
    path: 'tematicas/dialog',
    component: ThematicDialogComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  {
    path: 'stickers/:thematicId',
    component: StickersComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  {
    path: 'questionary/:tematicId',
    component: QuestionaryComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  {
    path: 'question-answers/:thematicId/:questionaryId',
    component: QuestionAnswersComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  {
    path: 'econobookadmin',
    component: EconobookAdminComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' }
  },
  { path: 'econonewsadmin', component: EcononewsAdminComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
  { path: 'econopleyadmin', component: EconopleyAdminComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
  { path: 'econovidiosadmin', component: EconovidiosAdminComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } }
  // Puedes agregar más rutas si es necesario
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

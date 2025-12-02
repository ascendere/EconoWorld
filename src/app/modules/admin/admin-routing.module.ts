// admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importar los componentes
import { ThematicsComponent } from './econotestAdmin/components/thematics/thematics.component';
import { EconobookAdminComponent } from './econobookAdmin/forms/econobok.component.admin'; // ✅ Formulario
import { ThematicDialogComponent } from './econotestAdmin/components/thematic-dialog/thematic-dialog.component';
import { StickersComponent } from './econotestAdmin/components/stickers/stickers.component';
import { QuestionaryComponent } from './econotestAdmin/components/questionary/questionary.component';
import { QuestionAnswersComponent } from './econotestAdmin/components/question-answers/question-answers.component';
import { AuthGuard } from 'src/app/services/guards/auth.guard';
import { EcononewsAdminComponent } from './econonewsAdmin/forms/econonews-admin.component';
import { EconoplayAdminComponent } from './econopleyAdmin/form/econopley-admin.component';
import { EconovidiosAdminComponent } from './econovidiosAdmin/form/econovidios-admin.component';
import { VideosListComponent } from './econovidiosAdmin/list/videos-list.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { NewsListComponent } from './econonewsAdmin/list/new-list.component';
import { BookListComponent } from './econobookAdmin/list/book-list.component'; // ✅ Lista
import { PlayListComponent } from './econopleyAdmin/list/play-list.component';
import { EconodataAdminComponent } from './econodataAdmin/form/econodata.component.admin';
import { DataListComponent } from './econodataAdmin/list/data-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'tematicas',
    component: ThematicsComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'tematicas/dialog',
    component: ThematicDialogComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'stickers/:thematicId',
    component: StickersComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'questionary/:tematicId',
    component: QuestionaryComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'question-answers/:thematicId/:questionaryId',
    component: QuestionAnswersComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },

  // ============================================
  // RUTAS DE ECONOBOOK
  // ============================================
  {
    path: 'books',
    component: BookListComponent, 
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'books/new',
    component: EconobookAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'books/edit/:id',
    component: EconobookAdminComponent, 
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },

  // ============================================
  // RUTAS DE ECONONEWS
  // ============================================
  {
    path: 'news',
    component: NewsListComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'news/new',
    component: EcononewsAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'news/edit/:id',
    component: EcononewsAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },

  // ============================================
  // RUTAS DE ECONOVIDEOS
  // ============================================
  {
    path: 'videos',
    component: VideosListComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'videos/new',
    component: EconovidiosAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'videos/edit/:id',
    component: EconovidiosAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },

  // ============================================
  // RUTAS DE ECONOPLAY
  // ============================================
  {
    path: 'play',
    component: PlayListComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'play/new',
    component: EconoplayAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'play/edit/:id',
    component: EconoplayAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  // ============================================
  // RUTAS DE ECONODATA
  // ============================================
  {
    path: 'data',
    component: DataListComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'data/new',
    component: EconodataAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'data/edit/:id',
    component: EconodataAdminComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
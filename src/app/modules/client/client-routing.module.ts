import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeClientComponent } from './econotest/home/home-client.component';
import { ListTestComponent } from './econotest/list-test/list-test.component';
import { EvaluationsComponent } from './econotest/evaluations/evaluations.component';
import { StikersComponent } from './econotest/stickers/stikers.component';
import { AuthGuard } from 'src/app/services/guards/auth.guard';

// 👇 Importa el componente público de EconoVideos
import { EconovideosComponent } from './econovideos/econovideos.component';

const routes: Routes = [
  {
    path: '',
    component: HomeClientComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'list-test/:id',
    component: ListTestComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':id/questionaries/:questionaryId/questions',
    component: EvaluationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':id/cromos',
    component: StikersComponent,
    canActivate: [AuthGuard],
  },
  { path: 'cromos', component: StikersComponent, canActivate: [AuthGuard] },

  { path: 'econovideos', component: EconovideosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}

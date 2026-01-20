import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeClientComponent } from './econotest/home/home-client.component';
import { ListTestComponent } from './econotest/list-test/list-test.component';
import { EvaluationsComponent } from './econotest/evaluations/evaluations.component';
import { StikersComponent } from './econotest/stickers/stikers.component';
import { EconovideosComponent } from './econovideos/econovideos.component';
import { EconoBookComponent } from './econobook/econobook.component';
import { EconobookViewerComponent } from './econobook/econobook1/econobook1.component';
import { AuthGuard } from 'src/app/services/guards/auth.guard';
import { EconoNewsComponent } from './econonew/econonew.component';
import { Econonews1Component } from './econonew/econonew1/econonews1.component';

const routes: Routes = [
{
  path: '',
  canActivate: [AuthGuard],
  children: [
      { path: '', component: HomeClientComponent },
      { path: 'list-test/:id', component: ListTestComponent },
      { path: ':id/questionaries/:questionaryId/questions', component: EvaluationsComponent },
      { path: ':id/cromos', component: StikersComponent },
      { path: 'cromos', component: StikersComponent },
      { path: 'econovideos', component: EconovideosComponent },
      { path: 'econobook', component: EconoBookComponent },
      { path: 'econobook/:id', component: EconobookViewerComponent },
      { path: 'econonews', component: EconoNewsComponent },
      { path: 'econonews/:id', component: Econonews1Component },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}

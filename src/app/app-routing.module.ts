import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EconoBookComponent } from './modules/client/econobook/econobook.component';
import { AuthGuard } from './services/guards/auth.guard';
import { EconoNewsComponent } from './modules/client/econonew/econonew.component';
import { Econonews1Component } from './modules/client/econonew/econonew1/econonews1.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule),
  },
  {
    path: 'tematica',
    loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: 'econobook',
    component: EconoBookComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: '' }
  },
  {
    path: 'econonews',
    component: EconoNewsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'econonews/:id',
    component: Econonews1Component,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

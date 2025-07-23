import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardComponent } from './page/dashboard/dashboard.component';
import { HomeClientComponent } from '../client/econotest/home/home-client.component';
import { EconoPlayComponent } from '../client/econopley/econopley.component';
import { Econopley1Component } from '../client/econopley/econopley1/econopley1.component';
import { EconoNewsComponent } from '../client/econonew/econonew.component';
import { EconoBookComponent } from '../client/econobook/econobook.component';
import { Econobook1Component } from '../client/econobook/econobook1/econobook1.component';
import { EconoDataComponent } from '../client/econodata/econodata.component';
import { EconoBotComponent } from '../client/econobot/econobot.component';
import { EconoVideosComponent } from '../client/econovideos/econovideos.component';
import { Econovideos1Component } from '../client/econovideos/econovideos1/econovideos1.component';
import { Econonews1Component } from '../client/econonew/econonew1/econonews1.component';

@Injectable({ providedIn: 'root' })
export class NoAdminOnLandingGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): Observable<boolean> {
    return this.authService.getUser().pipe(
      map(user => {
        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
          return false;
        }
        return true;
      })
    );
  }
}

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [NoAdminOnLandingGuard] },
  { path: 'econotest', component: HomeClientComponent },
  { path: 'econoplay', component: EconoPlayComponent },
  { path: 'econopley1', component: Econopley1Component },
  { path: 'econonews', component: EconoNewsComponent },
  { path: 'econobook', component: EconoBookComponent },
  { path: 'econobook1', component: Econobook1Component },
  { path: 'econodata', component: EconoDataComponent },
  { path: 'econobot', component: EconoBotComponent },
  { path: 'econovideos', component: EconoVideosComponent },
  { path: 'econovideos1', component: Econovideos1Component},
  { path: 'econonews1', component: Econonews1Component}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }

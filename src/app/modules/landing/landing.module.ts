import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ CORREGIDO
import { RouterModule } from '@angular/router'; // ✅ OK

import { LandingRoutingModule } from './landing-routing.module';

import { DashboardComponent } from './page/dashboard/dashboard.component';

import { HomeClientComponent } from '../client/econotest/home/home-client.component';
import { EconoPlayComponent } from '../client/econopley/econopley.component';
import { Econopley1Component } from '../client/econopley/econopley1/econopley1.component';
import { EconoBookComponent } from '../client/econobook/econobook.component';
import { Econobook1Component } from '../client/econobook/econobook1/econobook1.component';
import { EconoNewsComponent } from '../client/econonew/econonew.component';
import { EconoDataComponent } from '../client/econodata/econodata.component';
import { EconoBotComponent } from '../client/econobot/econobot.component';
import { EconoVideosComponent } from '../client/econovideos/econovideos.component';
import { Econovideos1Component } from '../client/econovideos/econovideos1/econovideos1.component';
import { Econonews1Component } from '../client/econonew/econonew1/econonews1.component';
@NgModule({
  declarations: [
    DashboardComponent,
    EconoPlayComponent,
    Econopley1Component,
    EconoBookComponent,
    Econobook1Component,
    EconoNewsComponent,
    EconoDataComponent,
    EconoBotComponent,
    EconoVideosComponent,
    Econovideos1Component,
    Econonews1Component
  ],
  imports: [
    CommonModule,
    RouterModule, // ✅ necesario si usas routerLink
    LandingRoutingModule
  ]
})
export class LandingModule {}

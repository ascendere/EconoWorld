import { CommonModule } from '@angular/common';
import { ThematicsService } from 'src/app/services/thematics.service';
import { ClientRoutingModule } from './client-routing.module';
import { HomeClientComponent } from './econotest/home/home-client.component';
import { NgModule } from '@angular/core';
import { ListTestComponent } from './econotest/list-test/list-test.component';
import { EvaluationsComponent } from './econotest/evaluations/evaluations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StikersComponent } from './econotest/stickers/stikers.component';
import { RouterModule } from '@angular/router';


import { EconovideosComponent } from './econovideos/econovideos.component';
import { EconoNewsComponent } from './econonew/econonew.component';
import { Econonews1Component } from './econonew/econonew1/econonews1.component';


@NgModule({
  declarations: [
    HomeClientComponent,
    ListTestComponent,
    EvaluationsComponent,
    StikersComponent,
    EconovideosComponent,
    EconoNewsComponent,
    Econonews1Component
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
  ],
  providers: [ThematicsService]
})
export class ClientModule { }

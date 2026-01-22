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
import { SharedModule } from '../shared/shared.module';
import { EconoBookComponent } from './econobook/econobook.component';
import { EconobookViewerComponent } from './econobook/econobook1/econobook1.component';
import { EconoDataComponent } from './econodata/econodata.component';
import { EconoPlayComponent } from './econopley/econopley.component';

@NgModule({
  declarations: [
    HomeClientComponent,
    ListTestComponent,
    EvaluationsComponent,
    StikersComponent,
    EconovideosComponent,
    EconoNewsComponent,
    Econonews1Component,
    EconoBookComponent,
    EconobookViewerComponent,
    EconoDataComponent,
    EconoPlayComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule
  ],
  providers: [ThematicsService]
})
export class ClientModule { }

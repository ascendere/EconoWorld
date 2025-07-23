import { CommonModule } from '@angular/common';
import { ThematicsService } from 'src/app/services/thematics.service';
import { ClientRoutingModule } from './client-routing.module';
import { HomeClientComponent } from './econotest/home/home-client.component';
import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { ListTestComponent } from './econotest/list-test/list-test.component';
import { EvaluationsComponent } from './econotest/evaluations/evaluations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StikersComponent } from './econotest/stickers/stikers.component';

import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HomeClientComponent,
    ListTestComponent,
    EvaluationsComponent,
    StikersComponent,
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [ThematicsService],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ClientModule { }

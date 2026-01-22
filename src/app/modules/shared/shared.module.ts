import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './pagination/pagination.component';
import { SafePipe } from './pipes/safe.pipe';


@NgModule({
  declarations: [
    PaginationComponent,
    SafePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PaginationComponent,
    SafePipe
  ]
})
export class SharedModule { }

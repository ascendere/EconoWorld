// src/app/modules/admin/admin.module.ts
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ CORRECTO
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

// Módulos internos
import { AdminRoutingModule } from './admin-routing.module';
import { EconotestModule } from './econotestAdmin/econotest.admin'; // ✅ Módulo funcional
import { EconobookAdminComponent } from './econobookAdmin/forms/econobok.component.admin'; // Asegúrate de importar el componente
import { VideosListComponent } from './econovidiosAdmin/list/videos-list.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EcononewsAdminComponent } from './econonewsAdmin/forms/econonews-admin.component';
import { EconoplayAdminComponent } from './econopleyAdmin/form/econopley-admin.component';
import { EconovidiosAdminComponent } from './econovidiosAdmin/form/econovidios-admin.component';


@NgModule({
  declarations: [
        EconobookAdminComponent,
        AdminDashboardComponent,
        EcononewsAdminComponent,
        EconoplayAdminComponent,
        EconovidiosAdminComponent,
        VideosListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    AdminRoutingModule,
    EconotestModule,
 // ✅ Submódulo bien importado
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AdminModule {}

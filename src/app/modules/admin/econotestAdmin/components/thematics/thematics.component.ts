// thematics.component.ts

import { Component, OnInit } from '@angular/core';
import { ThematicsService } from 'src/app/services/thematics.service';
import { MatDialog } from '@angular/material/dialog';
import { ThematicDialogComponent } from '../thematic-dialog/thematic-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thematics',
  templateUrl: './thematics.component.html',
  styleUrls: ['./thematics.component.scss']
})
export class ThematicsComponent implements OnInit {
  public thematics: any[] = [];

  constructor(private thematicService: ThematicsService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.loadThematics();
  }

  loadThematics(): void {
    this.thematicService.getThematics().subscribe(
      data => {
        this.thematics = data;
        console.log(this.thematics);
      },
      error => {
        console.error('Error al cargar las temáticas:', error);
      }
    );
  }

  navigateToStickers(thematic: any): void {
    this.router.navigate(['/stickers', thematic.id, { thematic }]);
  }

  navigateToQuestionary(thematic: any): void {
    // Puedes navegar a la página del cuestionario para la temática específica
    this.router.navigate(['/questionary', thematic.id,  { thematic }]);
  }

  openAddThematicDialog(): void {
    const dialogRef = this.dialog.open(ThematicDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Aquí puedes manejar los datos ingresados en el cuadro de diálogo, como guardar la temática.
      if (result) {
        // Lógica para agregar la temática
        this.thematicService.createThematic(result).then(() => {
          // Recargar la lista de temáticas después de crear una nueva
          this.loadThematics();
        }).catch(error => {
          console.error('Error al guardar la temática:', error);
        });
      }
    });
  }

  openEditThematicDialog(thematic: any): void {
    const dialogRef = this.dialog.open(ThematicDialogComponent, {
      width: '400px',
      data: { thematic },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // La temática se guardó con éxito, puedes cerrar la tarjeta o hacer cualquier otra acción necesaria.
        // En este ejemplo, simplemente recargamos las temáticas.
        this.loadThematics();
      }
    });
  }

  deleteThematic(thematic: any): void {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la temática "${thematic.name}"?`);

    if (confirmDelete) {
      this.thematicService.deleteThematic(thematic.id).then(() => {
        this.loadThematics();
      }).catch(error => {
        console.error('Error al eliminar la temática:', error);
      });
    }
  }


}

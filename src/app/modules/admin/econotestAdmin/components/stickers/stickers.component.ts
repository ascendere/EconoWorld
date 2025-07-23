import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ThematicsService } from 'src/app/services/thematics.service';
import { StickersDialogComponent } from '../stickers-dialog/stickers-dialog.component';
import { StickersService } from 'src/app/services/stickers.service';

@Component({
  selector: 'app-stickers',
  templateUrl: './stickers.component.html',
  styleUrls: ['./stickers.component.scss'],
})
export class StickersComponent implements OnInit {
  thematicId: string = '';
  thematicName: string | null = null;
  stickers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private stickersService: StickersService,
    private thematicsService: ThematicsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.thematicId = params.get('thematicId') ?? ''; // Asignar el valor a thematicId o cadena vacía si es null
      this.loadThematicName();
    });
  }

  loadThematicName(): void {
    this.thematicsService.getThematic(this.thematicId).subscribe(
      (thematic) => {
        this.thematicName = thematic.name;
        this.loadStickers();
      },
      (error) => {
        console.error('Error al cargar el nombre de la temática:', error);
      }
    );
  }

  loadStickers(): void {
    console.log('Thematic ID:', this.thematicId);
    this.stickersService.getStickersByThematicId(this.thematicId).subscribe(
      (data) => {
        this.stickers = data;
        console.log('Stickers cargados:', this.stickers);
        this.closeCardIfOpen();
      },
      (error) => {
        console.error('Error al cargar los stickers:', error);
      }
    );
  }

  openAddStickerDialog(): void {
    const dialogRef = this.dialog.open(StickersDialogComponent, {
      width: '400px',
      data: { thematicId: this.thematicId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Puedes realizar acciones después de que se cierra el diálogo
      // Por ejemplo, recargar la lista de stickers.
      this.loadStickers();
    });
  }

  closeCardIfOpen(): void {
    const card = document.querySelector('.card.open');
    if (card) {
      card.classList.remove('open');
    }
  }
}

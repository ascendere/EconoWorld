// home-client.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThematicsService } from 'src/app/services/thematics.service';

@Component({
  selector: 'app-home',
  templateUrl: './home-client.component.html',
  styleUrls: ['./home-client.component.scss'],
})
export class HomeClientComponent implements OnInit {
  public thematics: any[] = [];

  constructor(
    private thematicService: ThematicsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadThematics();
  }

  loadThematics(): void {
    this.thematicService.getThematics().subscribe(
      (data) => {
        this.thematics = data;
        //console.log(this.thematics)
      },
      (error) => {
        console.error('Error al cargar las temáticas:', error);
      }
    );
  }

  getImageUrl(thematic: any): string {
    // Manejar la variación en la estructura de la propiedad 'image'
    if (typeof thematic.image === 'string') {
      // Si es una cadena, asumir que es la URL directa
      return thematic.image;
    } else if (thematic.image?.mapa?.url) {
      // Si tiene una estructura 'mapa', usar esa URL
      return thematic.image.mapa.url;
    } else if (thematic.image?.url) {
      // Si tiene un campo 'url', usar ese valor
      return thematic.image.url;
    } else {
      // En otros casos, devolver una cadena vacía o una URL predeterminada
      return ''; // o puedes proporcionar una URL predeterminada si lo deseas
    }
  }

  getBackgroundColor(index: number): string {
    const bgColors = [
      '#f8f8ec',
      '#aedd2b',
      '#E8ECEF',
      '#30a4e4',
      '#f8f8ec',
      '#aedd2b',
      '#E8ECEF',
    ];
    return bgColors[index % bgColors.length];
  }

  // Método en home-client.component.ts
  navigateToListTest(thematicId: string, thematicName: string): void {
    // Solo se pasa el ID en la URL, no el nombre
    const encodedThematicId = encodeURIComponent(thematicId);

    // Navegamos a la ruta sin el nombre en la URL
    this.router.navigate([
      '/tematica/list-test',
      encodedThematicId, // Solo pasamos el ID en la URL
    ]);
  }
}

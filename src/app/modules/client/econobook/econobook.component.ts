import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EconobookService, Libro } from 'src/app/services/econobook.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-econobook',
    templateUrl: './econobook.component.html',
    styleUrls: ['./econobook.component.scss']
})
export class EconoBookComponent implements OnInit {
  libros: Libro[] = [];
  librosDestacados: Libro[] = [];
  loading = true;
  error = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private econobookService: EconobookService
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.loading = true;
    this.error = false;

    // Cargar libros publicados
    this.econobookService.getPublishedBooks().subscribe({
      next: (libros: Libro[]) => {
        this.libros = libros;
        this.loading = false;
        console.log('Libros cargados:', libros);
      },
      error: (error: any) => {
        console.error('Error al cargar libros:', error);
        this.error = true;
        this.loading = false;
      }
    });

    // Cargar libros destacados
    this.econobookService.getFeaturedBooks().subscribe({
      next: (libros: Libro[]) => {
        this.librosDestacados = libros;
        console.log('Libros destacados cargados:', libros);
      },
      error: (error: any) => {
        console.error('Error al cargar libros destacados:', error);
      }
    });
  }

  // Método para generar estrellas basado en el nivel de recomendación
  generarEstrellas(nivel: number): string {
    const estrellasLlenas = '★'.repeat(nivel);
    const estrellasVacias = '☆'.repeat(5 - nivel);
    return estrellasLlenas + estrellasVacias;
  }

  // Método para obtener imagen por defecto si no hay portada
  obtenerImagenPortada(libro: Libro): string {
    if (libro.portadaUrl && libro.portadaUrl.trim() !== '') {
      return libro.portadaUrl;
    }
    // Imagen por defecto basada en el título o autor
    return 'assets/images/libro.png';
  }

  // Método para obtener URL del archivo
  obtenerArchivoUrl(libro: Libro): string {
    if (libro.archivoUrl && libro.archivoUrl.trim() !== '') {
      return libro.archivoUrl;
    }
    return '#';
  }

  iniciar(): void {
    this.router.navigate(['/econobook']);
  }
}
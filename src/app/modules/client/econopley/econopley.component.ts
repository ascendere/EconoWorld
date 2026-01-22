import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconoplayAdminService, Game } from 'src/app/services/admin/econoplay-admin.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaginationBase

 } from '../../shared/pagination-base';
@Component({
  selector: 'app-econopley',
  templateUrl: './econopley.component.html',
  styleUrls: ['./econopley.component.scss']
})
export class EconoPlayComponent extends PaginationBase implements OnInit {

  games: Game[] = [];
  gamesFiltrados: Game[] = [];
  cargando = true;
  categoriaActual = 'Todos';
  terminoBusqueda = '';

  // 🎮 Variables para el modal
  mostrarModal = false;
  juegoSeleccionado: Game | null = null;
  juegoEmbedUrl: SafeResourceUrl | null = null;

  // 📋 Categorías reales de Firebase
  categorias = [
    'Todos',
    'Habilidades',
    'Macroeconomía',
    'Microeconomía',
    'Finanzas',
    'Economía General'
  ];

  override itemsPerPage = 6;

  constructor(
    private router: Router,
    private econoplayService: EconoplayAdminService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit(): void {
    this.cargarJuegos();
  }

  get pagedGames(): Game[] {
    return this.paginate(this.gamesFiltrados);
  }

  cargarJuegos(): void {
    this.cargando = true;

    this.econoplayService.getGames().subscribe({
      next: (data) => {
        this.games = data;
        this.gamesFiltrados = [...this.games];
        this.cargando = false;
        console.log('✅ Juegos cargados:', this.games);
      },
      error: (err) => {
        console.error('❌ Error al cargar juegos:', err);
        this.cargando = false;
      }
    });
  }

  // 🔍 Filtrar por categoría
  filtrarPorCategoria(categoria: string): void {
    this.categoriaActual = categoria;
    this.terminoBusqueda = ''; // Limpiar búsqueda al cambiar categoría
    this.aplicarFiltros();
  }

  // 🔍 Buscar juegos por nombre o instrucciones
  buscarJuegos(): void {
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.onSearchChange();
    let juegosTemp = [...this.games];

    if (this.categoriaActual && this.categoriaActual !== 'Todos') {
      const catFiltro = this.categoriaActual.toLowerCase().trim();

      juegosTemp = juegosTemp.filter(g => {
        const gameCat = (g.category || '').toLowerCase().trim();
        return gameCat === catFiltro;
      });
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase().trim();

      juegosTemp = juegosTemp.filter(g =>
        (g.name?.toLowerCase().includes(busqueda)) ||
        (g.instructions?.toLowerCase().includes(busqueda))
      );
    }

    this.gamesFiltrados = juegosTemp;

    console.log('Filtrando por:', this.categoriaActual, '| Resultados:', this.gamesFiltrados.length);
  }

  // 🎮 Abrir juego en modal
  abrirJuego(game: Game): void {
    if (!game.embedCode) {
      alert('Este juego no tiene código embebido disponible');
      return;
    }

    this.juegoSeleccionado = game;

    // Sanitizar el código embebido (puede ser iframe o URL)
    if (game.embedCode.includes('<iframe')) {
      // Si ya es un iframe completo, extraer el src
      const srcMatch = game.embedCode.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        this.juegoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(srcMatch[1]);
      }
    } else {
      // Si es solo una URL
      this.juegoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(game.embedCode);
    }

    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.juegoSeleccionado = null;
    this.juegoEmbedUrl = null;
    document.body.style.overflow = 'auto';
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navegarAEconopley1(): void {
    this.router.navigate(['/econopley1']);
  }
}

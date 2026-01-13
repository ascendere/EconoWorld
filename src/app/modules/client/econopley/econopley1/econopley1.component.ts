import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconoplayAdminService, Game } from 'src/app/services/admin/econoplay-admin.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-econopley1',
  templateUrl: './econopley1.component.html',
  styleUrls: ['./econopley1.component.scss']
})
export class Econopley1Component implements OnInit {

  games: Game[] = [];
  gamesFiltrados: Game[] = [];
  cargando = true;
  categoriaActual = 'Todos';
  terminoBusqueda = '';

  // 🎮 Variables para el modal
  mostrarModal = false;
  juegoSeleccionado: Game | null = null;
  juegoEmbedUrl: SafeResourceUrl | null = null;

  // 📋 Categorías disponibles
  categorias = [
    'Todos',
    'Habilidades',
    'Macroeconomía',
    'Microeconomía',
    'Finanzas',
    'Economía General'
  ];

  constructor(
    private router: Router,
    private econoplayService: EconoplayAdminService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarJuegos();
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
    this.terminoBusqueda = '';
    this.aplicarFiltros();
  }

  // 🔍 Buscar juegos
  buscarJuegos(): void {
    this.aplicarFiltros();
  }

  // 🔧 Aplicar filtros combinados
  private aplicarFiltros(): void {
    let juegosTemp = [...this.games];

    // Filtro por categoría
    if (this.categoriaActual !== 'Todos') {
      juegosTemp = juegosTemp.filter(
        g => g.category === this.categoriaActual
      );
    }

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase();
      juegosTemp = juegosTemp.filter(g => 
        g.name?.toLowerCase().includes(busqueda) ||
        g.instructions?.toLowerCase().includes(busqueda)
      );
    }

    this.gamesFiltrados = juegosTemp;
  }

  // 🎮 Abrir juego en modal
  abrirJuego(game: Game): void {
    if (!game.embedCode) {
      alert('Este juego no tiene código embebido disponible');
      return;
    }

    this.juegoSeleccionado = game;

    // Sanitizar el código embebido
    if (game.embedCode.includes('<iframe')) {
      const srcMatch = game.embedCode.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        this.juegoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(srcMatch[1]);
      }
    } else {
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

  regresar(): void {
    this.router.navigate(['/econoplay']);
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-econovideos1',
  templateUrl: './econovideos1.component.html',
  styleUrls: ['./econovideos1.component.scss']
})
export class Econovideos1Component implements OnInit {

  videos: Video[] = [];
  videosFiltrados: Video[] = [];
  cargando = true;
  categoriaActual = 'Todos';
  terminoBusqueda = '';

  // 🎬 Variables para el modal
  mostrarModal = false;
  videoSeleccionado: Video | null = null;
  videoEmbedUrl: SafeResourceUrl | null = null;

  // 📋 Lista de categorías disponibles
  categorias = [
    'Todos',
    'Macroeconomía',
    'Microeconomía',
    'Finanzas',
    'Política Económica',
    'Comercio Exterior',
    'Desarrollo Económico',
    'Econometría',
    'Economía Internacional'
  ];

  constructor(
    private router: Router,
    private econovideosService: EconovideosAdminService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarVideos();
  }

  cargarVideos(): void {
    this.cargando = true;
    
    this.econovideosService.getVideos().subscribe({
      next: (data) => {
        this.videos = data.map(v => ({
          ...v,
          thumbnailUrl: this.getYoutubeThumbnail(this.extractUrl(v.videoUrl))
        }));
        
        this.videosFiltrados = [...this.videos]; // Mostrar todos inicialmente
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar videos:', err);
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

  // 🔍 Buscar videos por título o descripción
  buscarVideos(): void {
    this.aplicarFiltros();
  }

  // 🔧 Aplicar filtros combinados (categoría + búsqueda)
  private aplicarFiltros(): void {
    let videosTemp = [...this.videos];

    // Filtro por categoría
    if (this.categoriaActual !== 'Todos') {
      videosTemp = videosTemp.filter(
        v => v.category === this.categoriaActual
      );
    }

    // Filtro por búsqueda (título, descripción o autor)
    if (this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase();
      videosTemp = videosTemp.filter(v => 
        v.title?.toLowerCase().includes(busqueda) ||
        v.description?.toLowerCase().includes(busqueda) ||
        v.author?.some(a => a.toLowerCase().includes(busqueda))
      );
    }

    this.videosFiltrados = videosTemp;
  }

  // 🎬 Abrir video en modal
  abrirVideo(video: Video): void {
    const url = this.extractUrl(video.videoUrl);

    if (!url) {
      this.notificationService.error('Este video no tiene enlace disponible');
      return;
    }

    this.videoSeleccionado = video;
    
    // Detectar si es YouTube o archivo directo
    const videoId = this.extractYoutubeId(url);
    
    if (videoId) {
      // URL de YouTube embebida
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      // Video directo (MP4, etc.)
      this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.videoSeleccionado = null;
    this.videoEmbedUrl = null;
    document.body.style.overflow = 'auto';
  }

  // 🔧 Métodos auxiliares
  private extractUrl(videoUrl?: { name: string; url: string }): string | undefined {
    return videoUrl?.url;
  }

  private getYoutubeThumbnail(url?: string): string {
    if (!url) return 'assets/images/econovidios.png';

    const videoId = this.extractYoutubeId(url);

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : 'assets/images/econovidios.png';
  }

  private extractYoutubeId(url: string): string | null {
    const regExp = /(?:v=|\/embed\/|\.be\/|\/v\/|\/shorts\/)([^#\&\?]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  // 📅 Formatear fecha para mostrar
  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    
    if (isNaN(date.getTime())) return '';
    
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const año = date.getFullYear();
    
    return `${dia}.${mes}.${año}`;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  regresar(): void {
    this.router.navigate(['/econovideos']);
  }
}
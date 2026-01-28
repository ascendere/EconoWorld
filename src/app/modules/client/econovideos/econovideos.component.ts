import { Component, OnInit } from '@angular/core';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';
import { EconoVideosService } from 'src/app/services/econovideos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaginationBase } from '../../shared/pagination-base';
import { NotificationService } from 'src/app/core/services/notification.service';
import { BaseResource } from '../../shared/base';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-econovideos',
  templateUrl: './econovideos.component.html',
  styleUrls: ['./econovideos.component.scss']
})
export class EconovideosComponent extends BaseResource implements OnInit {

  videos: Video[] = [];
  videosFiltrados: Video[] = []
  cargando = true;

  // 🎯 Variables para el modal
  mostrarModal = false;
  videoSeleccionado: Video | null = null;
  videoEmbedUrl: SafeResourceUrl | null = null;
  categoriaActual = 'Todos';
  terminoBusqueda = '';

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

  override itemsPerPage = 10;
  constructor(
    private econovideosService: EconovideosAdminService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private authService: AuthService,
    private econovideosNAService: EconoVideosService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe(userData => {
      this.userId = userData ? (userData.uid || userData.id) : null;
    });

    this.econovideosService.getVideos().subscribe({
      next: (data) => {
        this.videos = data.map(v => ({
          ...v,
          thumbnailUrl: this.getYoutubeThumbnail(this.extractUrl(v.videoUrl))
        }));
        this.videosFiltrados = [...this.videos];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar videos', err);
        this.cargando = false;
      }
    });
  }

  get pagedVideos(): Video[] {
    return this.paginate(this.videosFiltrados);
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaActual = categoria;
    this.terminoBusqueda = '';
    this.aplicarFiltros();
  }

  buscarVideos(): void {
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.onSearchChange();
    let videosTemp = [...this.videos];

    if (this.categoriaActual !== 'Todos') {
      videosTemp = videosTemp.filter(v => v.category === this.categoriaActual);
    }

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

  abrirVideo(video: Video): void {
    const url = this.extractUrl(video.videoUrl);

    if (!url) {
      this.notificationService.error('Este video no tiene enlace disponible');
      return;
    }

    this.videoSeleccionado = video;

    // 🎬 Detectar si es YouTube o archivo directo
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

    // 🚫 Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.videoSeleccionado = null;
    this.videoEmbedUrl = null;

    // ✅ Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

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

  // 🎯 Detectar si es video de YouTube
  esYoutube(url?: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLike(video: Video) {
    this.toggleReaction(video, 'like', (v) => {
      this.econovideosNAService.updateVideoReactions(v.id, {
        likes: v.likes,
        dislikes: v.dislikes,
        likedBy: v.likedBy,
        dislikedBy: v.dislikedBy
      });
    });
  }

  onDislike(video: Video) {
    this.toggleReaction(video, 'dislike', (v) => {
      this.econovideosNAService.updateVideoReactions(v.id, {
        likes: v.likes,
        dislikes: v.dislikes,
        likedBy: v.likedBy,
        dislikedBy: v.dislikedBy
      });
    });
  }

  trackByVideoId(index: number, item: Video): string | undefined {
    return item.id;
  }
}

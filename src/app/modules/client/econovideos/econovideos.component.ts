import { Component, OnInit } from '@angular/core';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-econovideos',
  templateUrl: './econovideos.component.html',
  styleUrls: ['./econovideos.component.scss']
})
export class EconovideosComponent implements OnInit {

  videos: Video[] = [];
  cargando = true;

  // 🎯 Variables para el modal
  mostrarModal = false;
  videoSeleccionado: Video | null = null;
  videoEmbedUrl: SafeResourceUrl | null = null;

  constructor(
    private econovideosService: EconovideosAdminService,
    private sanitizer: DomSanitizer // 🔒 Para URLs seguras
  ) { }

  ngOnInit(): void {
    this.econovideosService.getVideos().subscribe({
      next: (data) => {
        this.videos = data.map(v => ({
          ...v,
          thumbnailUrl: this.getYoutubeThumbnail(this.extractUrl(v.videoUrl))
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar videos', err);
        this.cargando = false;
      }
    });
  }

  abrirVideo(video: Video): void {
    const url = this.extractUrl(video.videoUrl);

    if (!url) {
      alert('Este video no tiene enlace disponible');
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

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
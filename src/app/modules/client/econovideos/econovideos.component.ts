import { Component, OnInit } from '@angular/core';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';

@Component({
  selector: 'app-econovideos',
  templateUrl: './econovideos.component.html',
  styleUrls: ['./econovideos.component.scss']
})
export class EconovideosComponent implements OnInit {

  videos: Video[] = [];
  cargando = true;

  constructor(private econovideosService: EconovideosAdminService) {}


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
        console.error('❌ Error al cargar videos', err);
        this.cargando = false;
      }
    });
  }

  abrirVideo(video: Video): void {
    const url = this.extractUrl(video.videoUrl);

    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Este video no tiene enlace disponible');
    }
  }

  private extractUrl(
    videoUrl?: { name: string; url: string }[]
  ): string | undefined {
    return videoUrl && videoUrl.length > 0 ? videoUrl[0].url : undefined;
  }

  private getYoutubeThumbnail(url?: string): string {
    if (!url) return 'assets/images/econovidios.png';

    const videoId = this.extractYoutubeId(url);

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : 'assets/images/econovidios.png';
  }

  private extractYoutubeId(url: string): string | null {
    const regExp =
      /(?:v=|\/embed\/|\.be\/|\/v\/|\/shorts\/)([^#\&\?]{11})/;

    const match = url.match(regExp);
    return match ? match[1] : null;
  }
}

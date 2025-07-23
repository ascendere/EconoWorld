import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  views: string;
  date: string;
}

@Component({
  selector: 'app-econovideos1',
  templateUrl: './econovideos1.component.html',
  styleUrls: ['./econovideos1.component.scss']
})
export class Econovideos1Component implements OnInit {

  videos: Video[] = [];

  constructor(private router: Router) {
    this.loadVideos();
  }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    // Datos de ejemplo para los videos
    this.videos = [
      {
        id: 1,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 2,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 3,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 4,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 5,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 6,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 7,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 8,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '27.5.225'
      },
      {
        id: 9,
        title: '¿Por qué suben los precios?...',
        thumbnail: 'assets/images/personavideos.png',
        views: '16 mil visitas',
        date: '270.050.2025'
      }
    ];
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onVideoClick(video: Video): void {
    // Aquí puedes agregar la lógica para reproducir el video
    console.log('Reproduciendo video:', video.title);
  }
  regresar(): void {
    this.router.navigate(['/econovideos']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';
import { NotificationService } from 'src/app/core/services/notification.service';


@Component({
  selector: 'app-videos-list',
  templateUrl: './videos-list.component.html',
  styleUrls: ['./videos-list.component.scss']
})

export class VideosListComponent implements OnInit {

  videos: Video[] = [];
  filteredVideos: Video[] = [];

  searchTerm: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private videoService: EconovideosAdminService,
    private router: Router,
    private notificationService: NotificationService

  ) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.videoService.getVideos().subscribe({
      next: (data) => {
        this.videos = data;
        this.filteredVideos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar videos';
        this.isLoading = false;
      }
    });
  }

  searchVideos(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVideos = this.videos;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredVideos = this.videos.filter(v =>
      v.title.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term)
    );
  }

  crear(): void {
    this.router.navigate(['/admin/videos/new']);
  }

  editar(v: Video): void {
    this.router.navigate(['/admin/videos/edit', v.id]);
  }

  async eliminar(v: Video): Promise<void> {
    if (!confirm(`¿Seguro que deseas eliminar "${v.title}"?`)) return;

    this.isLoading = true;

    try {
      await this.videoService.deleteVideo(v.id!);
      this.videos = this.videos.filter(x => x.id !== v.id);
      this.filteredVideos = this.filteredVideos.filter(x => x.id !== v.id);
      this.notificationService.success
        ('Video eliminado');
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Error al eliminar video';
    } finally {
      this.isLoading = false;
    }
  }

  regresar(): void {
    this.router.navigate(['/admin']);
  }
}

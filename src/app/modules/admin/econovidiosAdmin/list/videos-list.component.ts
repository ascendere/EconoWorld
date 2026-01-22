import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';
import { PaginationBase } from 'src/app/modules/shared/pagination-base';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { NotificationService } from 'src/app/core/services/notification.service';


@Component({
  selector: 'app-videos-list',
  templateUrl: './videos-list.component.html',
  styleUrls: ['./videos-list.component.scss']
})

export class VideosListComponent extends PaginationBase implements OnInit {

  videos: Video[] = [];
  filteredVideos: Video[] = [];

  searchTerm: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';

  override itemsPerPage = 10;
  constructor(
    private videoService: EconovideosAdminService,
    private router: Router,
    private notificationService: NotificationService

  ) {
    super();
   }

  ngOnInit(): void {
    this.loadVideos();
  }

  get pagedVideos(): Video[] {
    return this.paginate(this.filteredVideos);
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
    this.onSearchChange();
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

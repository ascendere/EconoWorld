import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EconoplayAdminService, Game } from 'src/app/services/admin/econoplay-admin.service';
import { PaginationBase } from 'src/app/modules/shared/pagination-base';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { NotificationService } from 'src/app/core/services/notification.service';


@Component({
  selector: 'app-econoplay-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './play-list.component.html',
  styleUrls: ['./play-list.component.scss']
})
export class PlayListComponent extends PaginationBase implements OnInit {

  games: Game[] = [];
  filteredGames: Game[] = [];

  searchTerm: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';

  override itemsPerPage = 10;

  constructor(
    private econoplayService: EconoplayAdminService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadGames();
  }

  get pagedGames(): Game[] {
    return this.paginate(this.filteredGames);
  }

  loadGames(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.econoplayService.getGames().subscribe({
      next: (data) => {
        this.games = data;
        this.filteredGames = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar juegos';
        this.isLoading = false;
      }
    });
  }

  searchGames(): void {
    this.onSearchChange();
    if (!this.searchTerm.trim()) {
      this.filteredGames = this.games;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredGames = this.games.filter(g =>
      g.name.toLowerCase().includes(term) ||
      g.category.toLowerCase().includes(term)
    );
  }

  crear(): void {
    this.router.navigate(['/admin/play/new']);
  }

  editar(game: Game): void {
    this.router.navigate(['/admin/play/edit', game.id]);
  }

  async eliminar(game: Game): Promise<void> {
    if (!confirm(`¿Seguro que deseas eliminar el juego "${game.name}"?`)) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.econoplayService.deleteGame(game.id!);

      this.games = this.games.filter(x => x.id !== game.id);
      this.filteredGames = this.filteredGames.filter(x => x.id !== game.id);

      this.notificationService.success('Juego eliminado correctamente');
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Error al eliminar juego';
    } finally {
      this.isLoading = false;
    }
  }

  regresar(): void {
    this.router.navigate(['/admin']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcononewsAdminService, Noticia } from 'src/app/services/admin/econonews-admin.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewsListComponent implements OnInit {


  news: Noticia[] = [];

  filteredNews: Noticia[] = [];

  searchTerm: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private newsService: EcononewsAdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadNews(); 
  }

  loadNews(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.newsService.getNews().subscribe({
    next: (data) => {
      this.news = data;
      this.filteredNews = data;
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Error al cargar noticias';
      this.isLoading = false;
    }
  });
}


  searchNews(): void {
    if (!this.searchTerm.trim()) {
      this.filteredNews = this.news; 
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredNews = this.news.filter(n =>
      n.title.toLowerCase().includes(term) ||
      n.category.toLowerCase().includes(term)
    );
  }

  crear(): void {
    this.router.navigate(['/admin/news/new']); 
  }

  editar(n: Noticia): void {
    this.router.navigate(['/admin/news/edit', n.id]);
  }

  async eliminar(n: Noticia): Promise<void> {
    if (!confirm(`¿Seguro que deseas eliminar "${n.title}"?`)) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.newsService.deleteNews(n.id!);       
      this.news = this.news.filter(x => x.id !== n.id); 
      this.filteredNews = this.filteredNews.filter(x => x.id !== n.id);
      alert('Noticia eliminada');
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Error al eliminar noticia';
    } finally {
      this.isLoading = false;
    }
  }

  regresar(): void {
    this.router.navigate(['/admin']); 
  }
}

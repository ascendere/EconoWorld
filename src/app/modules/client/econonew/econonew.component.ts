import { Component, OnInit } from '@angular/core';
import { EconoNewService, News } from 'src/app/services/econonew.service';
import { PaginationBase } from '../../shared/pagination-base';

@Component({
  selector: 'app-dashboard',
  templateUrl: './econonew.component.html',
  styleUrls: ['./econonew.component.scss']
})
export class EconoNewsComponent extends PaginationBase implements OnInit {

  allNews: News[] = [];

  featuredNews!: News;
  galleryNews: News[] = [];
  latestNews: News[] = [];
  recentNews!: News;

  searchText = '';
  loading = true;

  mostrarModalInfo = false;

  constructor(private newsService: EconoNewService) {
    super();
  }

  ngOnInit(): void {
    this.newsService.getNews().subscribe(news => {
      this.loading = false;
      if (!news || news.length === 0) return;

      this.allNews = [...news];

      this.featuredNews = this.allNews[0];

      this.galleryNews = this.allNews.slice(1);

      this.latestNews = this.allNews.slice(0, 4);
      this.recentNews = this.allNews.length > 1 ? this.allNews[1] : this.allNews[0];
    });
  }

  get pagedNews(): News[] {
    return this.paginate(this.filteredNews);
  }

  get filteredNews(): News[] {
    if (!this.searchText.trim()) return this.galleryNews;

    const text = this.searchText.toLowerCase();
    return this.galleryNews.filter(n =>
      n.title.toLowerCase().includes(text) ||
      n.content.toLowerCase().includes(text) ||
      n.category.toLowerCase().includes(text)
    );
  }

  trackById(_: number, item: News) {
    return item.id;
  }

  /**
   * SOLUCIÓN MEJORADA PARA IMÁGENES
   * Prioridad: 1. Imagen manual, 2. Placeholder categorizado, 3. Fallback
   */
  getAutoImage(news: any): string {

    // 2. Imagen placeholder categorizada y profesional
    const category = news?.category?.toLowerCase() || 'general';

    const categoryImages: { [key: string]: string } = {
      'internacional': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop',
      'nacional': 'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&h=600&fit=crop',
      'economia': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
      'finanzas': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop',
      'tecnologia': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      'negocios': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
    };

    // 3. Retornar imagen según categoría o fallback
    return categoryImages[category] || categoryImages['economia'];
  }

  /**
   * Truncar contenido HTML de forma segura
   */
  getTruncatedContent(content: string, maxLength: number = 140): string {
    if (!content) return '';

    // Remover tags HTML
    const stripped = content.replace(/<[^>]*>/g, '');

    return stripped.length > maxLength
      ? stripped.substring(0, maxLength) + '...'
      : stripped;
  }

  /**
   * Obtener fecha formateada
   */
  getFormattedDate(news: any): string {
    if (news?.createdAt?.toDate) {
      return news.createdAt.toDate().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Fecha no disponible';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleModal(estado: boolean): void {
    this.mostrarModalInfo = estado;

      if (estado) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
}

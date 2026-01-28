import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EconoNewService, News } from 'src/app/services/econonew.service';
import { AuthService } from 'src/app/services/auth.service';
import { BaseResource } from 'src/app/modules/shared/base';

@Component({
  selector: 'app-econonews1',
  templateUrl: './econonews1.component.html',
  styleUrls: ['./econonews1.component.scss']
})
export class Econonews1Component extends BaseResource implements OnInit {

  news?: News;
  loading = true;
  newsId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: EconoNewService,
    private authService: AuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe(userData => {
      this.userId = userData ? (userData.uid || userData.id) : null;
    });
    // Obtener ID de la URL
    this.route.params.subscribe(params => {
      this.newsId = params['id'];
      this.loadNews();
    });
  }

  loadNews(): void {
    this.newsService.getNewsById(this.newsId).subscribe({
      next: (news) => {
        this.loading = false;

        if (!news) {
          console.error('❌ Noticia no encontrada');
          this.router.navigate(['/econonews']);
          return;
        }

        this.news = news;
      },
      error: (err) => {
        console.error('❌ Error al cargar noticia:', err);
        this.loading = false;
        this.router.navigate(['/econonews']);
      }
    });
  }

  getAutoImage(news: any): string {
    if (news?.resource?.url) {
      return news.resource.url;
    }

    const category = (news?.category?.toLowerCase() || 'general').trim();
    const categoryStyles: { [key: string]: { bg: string, text: string } } = {
      'internacional': { bg: '4A90E2', text: 'ffffff' },
      'nacional': { bg: 'E27A3F', text: 'ffffff' },
      'economia': { bg: '50C878', text: 'ffffff' },
      'economía': { bg: '50C878', text: 'ffffff' },
      'finanzas': { bg: 'FFD700', text: '333333' },
      'tecnologia': { bg: '9B59B6', text: 'ffffff' },
      'tecnología': { bg: '9B59B6', text: 'ffffff' },
      'negocios': { bg: '34495E', text: 'ffffff' },
      'general': { bg: '003f72', text: 'ffffff' }
    };

    const style = categoryStyles[category] || categoryStyles['general'];
    const text = category.toUpperCase();

    return `https://via.placeholder.com/800x600/${style.bg}/${style.text}?text=${encodeURIComponent(text)}`;
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/800x600/003f72/ffffff?text=ECONONEWS';
  }

  getFormattedDate(news?: News): string {
    if (!news || !news.createdAt) {
      return 'Fecha no disponible';
    }

    if (typeof news.createdAt.toDate === 'function') {
      return news.createdAt.toDate().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    return 'Fecha no disponible';
  }

  regresar(): void {
    this.router.navigate(['/econonews']);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Limpia tags HTML y trunca el texto
   */
  stripHtmlAndTruncate(html?: string, maxLength: number = 200): string {
    if (!html) return '';

    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';

    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  onLike(news: News) {
    this.toggleReaction(news, 'like', (updatedNews) => {
      this.newsService.updateNewsReactions(updatedNews.id, {
        likes: updatedNews.likes,
        dislikes: updatedNews.dislikes,
        likedBy: updatedNews.likedBy,
        dislikedBy: updatedNews.dislikedBy
      });
    });
  }

  onDislike(news: News) {
    this.toggleReaction(news, 'dislike', (updatedNews) => {
      this.newsService.updateNewsReactions(updatedNews.id, {
        likes: updatedNews.likes,
        dislikes: updatedNews.dislikes,
        likedBy: updatedNews.likedBy,
        dislikedBy: updatedNews.dislikedBy
      });
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconobookService, Book, Publisher, Author } from 'src/app/services/econobook.service';
import { PaginationBase } from '../../shared/pagination-base';
import { NotificationService } from 'src/app/core/services/notification.service';
import { BaseResource } from '../../shared/base';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-econobook',
  templateUrl: './econobook.component.html',
  styleUrls: ['./econobook.component.scss']
})
export class EconoBookComponent extends BaseResource implements OnInit {

  publishedBooks: Book[] = [];
  featuredBooks: Book[] = [];
  filteredBooks: Book[] = [];

  // PROPIEDADES PARA EDITORIALES Y AUTORES
  featuredPublishers: Publisher[] = [];
  featuredAuthors: Author[] = [];

  loading: boolean = false;
  errorMessage: string | null = null;

  selectedBook: Book | null = null;

  searchTerm: string = '';
  currentFilter: string = 'latest';

  override itemsPerPage = 8;

  constructor(
    private router: Router,
    private econobookService: EconobookService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe(userData => {
      if (userData) {
        this.userId = userData.uid || userData.id;
      } else {
        this.userId = null;
      }
    });

    this.loadBooks();
    this.loadFeaturedPublishers();
    this.loadFeaturedAuthors();
  }

  get pagedBooks(): Book[] {
    return this.paginate(this.filteredBooks);
  }

  loadBooks(): void {
    this.loading = true;
    this.errorMessage = null;

    this.econobookService.getPublishedBooks().subscribe({
      next: (books: Book[]) => {
        this.publishedBooks = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading published books', error);
        this.errorMessage = 'No se pudieron cargar los libros';
        this.loading = false;
      }
    });

    this.econobookService.getFeaturedBooks().subscribe({
      next: (books: Book[]) => {
        this.featuredBooks = books;
        this.filteredBooks = books;
      },
      error: (error) => {
        console.error('Error loading featured books', error);
      }
    });
  }

  // 🆕 CARGAR EDITORIALES DESTACADAS
  loadFeaturedPublishers(): void {
    this.econobookService.getFeaturedPublishers().subscribe({
      next: (publishers: Publisher[]) => {
        this.featuredPublishers = publishers;
        console.log('Featured publishers:', publishers);
      },
      error: (error) => {
        console.error('Error loading publishers', error);
      }
    });
  }

  // 🆕 CARGAR AUTORES DESTACADOS
  loadFeaturedAuthors(): void {
    this.econobookService.getFeaturedAuthors().subscribe({
      next: (authors: Author[]) => {
        this.featuredAuthors = authors;
      },
      error: (error) => {
        console.error('Error loading featured authors', error);
      }
    });
  }

  onSearch(): void {
    this.onSearchChange();
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredBooks = this.featuredBooks;
      return;
    }

    this.filteredBooks = this.featuredBooks.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.authors.some(author => author.toLowerCase().includes(term)) ||
      (book.publisher && book.publisher.toLowerCase().includes(term))
    );
  }

  applyFilter(filter: string): void {
    this.currentFilter = filter;

    switch (filter) {
      case 'latest':
        this.filteredBooks = [...this.featuredBooks].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;

      case 'editions':
        this.filteredBooks = [...this.featuredBooks].sort((a, b) => {
          return (b.year || 0) - (a.year || 0);
        });
        break;

      case 'trending':
        this.filteredBooks = [...this.featuredBooks].sort(() => Math.random() - 0.5);
        break;

      default:
        this.filteredBooks = this.featuredBooks;
    }
  }

  openBook(book: Book): void {
    if (!book?.pdfUrl) {
      this.notificationService.error('Este libro no tiene un PDF disponible');
      return;
    }

    this.selectedBook = book;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selectedBook = null;
    document.body.style.overflow = 'auto';
  }

  verMasLibros(): void {
    this.router.navigate(['/econobook1']);
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLike(book: Book) {
    this.toggleReaction(book, 'like', (b) => {
      this.econobookService.updateBookReactions(b.id, {
        likes: b.likes,
        dislikes: b.dislikes,
        likedBy: b.likedBy,
        dislikedBy: b.dislikedBy
      });
    });
  }

  onDislike(book: Book) {
    this.toggleReaction(book, 'dislike', (b) => {
      this.econobookService.updateBookReactions(b.id, {
        likes: b.likes,
        dislikes: b.dislikes,
        likedBy: b.likedBy,
        dislikedBy: b.dislikedBy
      });
    });
  }

  trackByBookId(index: number, book: Book): string | undefined {
    return book.id; // O book.id si usas ese campo
  }
}

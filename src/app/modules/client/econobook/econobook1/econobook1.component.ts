import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconobookService, Book } from 'src/app/services/econobook.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-econobook1',
  templateUrl: './econobook1.component.html',
  styleUrls: ['./econobook1.component.scss']
})
export class EconobookViewerComponent implements OnInit {

  // 📚 Todos los libros de Firebase
  allBooks: Book[] = [];
  filteredBooks: Book[] = [];

  // 🔍 Filtros y búsqueda
  searchTerm: string = '';
  currentFilter: string = 'all';

  // 🎯 Estados
  loading: boolean = false;
  errorMessage: string | null = null;

  // 📖 Modal
  selectedBook: Book | null = null;

  constructor(
    private router: Router,
    private econobookService: EconobookService, 
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAllBooks();
  }

  // ✅ CARGAR TODOS LOS LIBROS
  loadAllBooks(): void {
    this.loading = true;
    this.errorMessage = null;

    this.econobookService.getPublishedBooks().subscribe({
      next: (books: Book[]) => {
        this.allBooks = books;
        this.filteredBooks = books;
        this.loading = false;
        console.log('Libros cargados:', books.length);
      },
      error: (error) => {
        console.error('Error al cargar libros:', error);
        this.errorMessage = 'No se pudieron cargar los libros';
        this.loading = false;
      }
    });
  }

  // 🔍 BÚSQUEDA DINÁMICA
  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredBooks = this.allBooks;
      this.applyCurrentFilter();
      return;
    }

    this.filteredBooks = this.allBooks.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.authors.some(author => author.toLowerCase().includes(term)) ||
      (book.publisher && book.publisher.toLowerCase().includes(term)) ||
      (book.description && book.description.toLowerCase().includes(term))
    );

    this.applyCurrentFilter();
  }

  // 🎛️ APLICAR FILTROS
  applyFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyCurrentFilter();
  }

  private applyCurrentFilter(): void {
    switch (this.currentFilter) {
      case 'latest':
        // Ordenar por fecha de creación (más reciente primero)
        this.filteredBooks = [...this.filteredBooks].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;

      case 'editions':
        // Ordenar por año de publicación (más reciente primero)
        this.filteredBooks = [...this.filteredBooks].sort((a, b) => {
          return (b.year || 0) - (a.year || 0);
        });
        break;

      case 'trending':
        // Ordenar por título alfabéticamente como "trending"
        this.filteredBooks = [...this.filteredBooks].sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      case 'all':
      default:
        // Sin filtro específico, mantener orden original
        break;
    }
  }

  // 📖 ABRIR MODAL PDF
  openBook(book: Book): void {
    if (!book?.pdfUrl) {
      this.notificationService.error('Este libro no tiene un PDF disponible');
      return;
    }
    this.selectedBook = book;
  }

  // ❌ CERRAR MODAL
  closeModal(): void {
    this.selectedBook = null;
  }

  // ⬅️ REGRESAR A LA PÁGINA PRINCIPAL
  regresar(): void {
    this.router.navigate(['/econobook']);
  }

  // ⬆️ SCROLL AL INICIO
  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 🔄 REINTENTAR CARGA
  retryLoad(): void {
    this.loadAllBooks();
  }
}

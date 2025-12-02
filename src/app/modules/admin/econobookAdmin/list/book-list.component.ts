import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EconobookAdminService, Book } from 'src/app/services/admin/econobook-admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-list',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule  
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  // Columnas para la tabla
  displayedColumns: string[] = ['title', 'author', 'description', 'coverUrl', 'actions'];

  constructor(
    private econobookAdminService: EconobookAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  async loadBooks(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const data = await this.econobookAdminService.getBooks();
      this.books = data;
      this.filteredBooks = data;
    } catch (error) {
      this.errorMessage = 'Error al cargar los libros';
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  searchBooks(): void {
    if (!this.searchTerm.trim()) {
      this.filteredBooks = this.books;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredBooks = this.books.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.authors.includes(term) ||
      book.description.toLowerCase().includes(term)
    );
  }

  createBook(): void {
    this.router.navigate(['/admin/books/new']);
  }

  editBook(book: Book): void {
    this.router.navigate(['/admin/books/edit', book.id]);
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }

  async deleteBook(book: Book): Promise<void> {
    // Confirmación con el título correcto
    if (!confirm(`¿Estás seguro de eliminar "${book.title}"?`)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.econobookAdminService.deleteBook(book.id!);
      
      // Mensaje de éxito (opcional: usar un servicio de notificaciones)
      console.log('Libro eliminado exitosamente');
      
      // Recargar la lista
      await this.loadBooks();
      
    } catch (error) {
      this.errorMessage = 'Error al eliminar el libro. Por favor, intenta nuevamente.';
      console.error('Error al eliminar:', error);
      this.isLoading = false;
    }
  }

  viewDetails(book: Book): void {
    this.router.navigate(['/admin/books', book.id]);
  }
}
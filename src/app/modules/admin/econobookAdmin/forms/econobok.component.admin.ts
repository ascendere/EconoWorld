import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EconobookAdminService, Book } from 'src/app/services/admin/econobook-admin.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-econobook-admin',
  templateUrl: './econobok.component.admin.html',
  styleUrls: ['./econobok.component.admin.scss']
})
export class EconobookAdminComponent implements OnInit {

  bookForm!: FormGroup;
  isEditMode = false;
  currentBookId: string | null = null;

  authors: string[] = [];
  authorInput = '';

  pdfFile: File | null = null;
  pdfSizeMB = 0;
  existingPdfUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: EconobookAdminService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      publisher: [''],
      year: ['', [Validators.pattern(/^[0-9]{4}$/)]],
      description: ['', Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.currentBookId = params['id'];
        this.loadBookData(params['id']);
      }
    });
  }

  async loadBookData(bookId: string): Promise<void> {
    try {
      const book: Book = await this.bookService.getBookById(bookId);

      if (!book) {
        this.notificationService.error('Libro no encontrado');
        this.goDashboard();
        return;
      }

      this.bookForm.patchValue({
        title: book.title ?? '',
        publisher: book.publisher ?? '',
        year: book.year ?? '',
        description: book.description ?? ''
      });

      this.authors = book.authors ?? [];

      this.existingPdfUrl = book.pdfUrl ?? null;

      if (book.pdfUrl) {
        this.pdfSizeMB = 0;
      }
    } catch (error) {
      console.error('Error al cargar el libro:', error);
      this.notificationService.error('No se pudo cargar la información del libro.');
      this.goDashboard();
    }
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }

  goTable() {
    this.router.navigate(['/admin/books']);
  }

  autoGrow(event: any) {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  addAuthor() {
    if (this.authorInput.trim() !== '') {
      this.authors.push(this.authorInput.trim());
      this.authorInput = '';
    }
  }

  removeAuthor(index: number) {
    this.authors.splice(index, 1);
  }

  onPdfSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      this.notificationService.info("Debe seleccionar un archivo PDF.");
      return;
    }

    const sizeMB = file.size / 1024 / 1024;

    this.pdfFile = file;
    this.pdfSizeMB = Number(sizeMB.toFixed(2));
  }

  openPDF() {
    if (this.pdfFile) {
      const url = URL.createObjectURL(this.pdfFile);
      window.open(url, "_blank");
    } else if (this.existingPdfUrl) {
      window.open(this.existingPdfUrl, "_blank");
    }
  }

  removePDF() {
    this.pdfFile = null;
    this.pdfSizeMB = 0;
  }

  resetForm() {
    this.bookForm.reset();
    this.authors = [];
    this.authorInput = '';
    this.pdfFile = null;
    this.pdfSizeMB = 0;
    this.isEditMode = false;
    this.currentBookId = null;
    this.existingPdfUrl = null;
  }

  async save() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      this.notificationService.warning('Complete los campos obligatorios.');
      return;
    }

    this.authors = this.authors.map(a => a.trim()).filter(a => a.length > 0);
    if (this.authors.length === 0) {
      this.notificationService.info('Debe agregar al menos un autor.');
      return;
    }

    if (!this.isEditMode && !this.pdfFile) {
      this.notificationService.info("Debe subir un archivo PDF.");
      return;
    }

    const bookData: Partial<Book> = {
      title: this.bookForm.value.title,
      publisher: this.bookForm.value.publisher,
      year: this.bookForm.value.year,
      description: this.bookForm.value.description,
      authors: this.authors,
      coverUrl: '',
      pdfUrl: this.existingPdfUrl || ''
    };

    if (!this.isEditMode) {
      (bookData as any).createdAt = new Date().toISOString();
    }

    try {
      if (this.isEditMode && this.currentBookId) {
        await this.bookService.updateBook(
          this.currentBookId,
          bookData,
          null,
          this.pdfFile
        );
        this.notificationService.success('Libro actualizado correctamente.');
      } else {
        await this.bookService.addBook(bookData as Book, null as any, this.pdfFile!);
        this.notificationService.success('Libro creado correctamente.');
      }

      this.resetForm();
      this.goDashboard();

    } catch (err) {
      console.error(err);
      this.notificationService.error(this.isEditMode ? 'Error al actualizar el libro.' : 'Error al guardar el libro.');
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  cancel() {
    if (confirm('¿Desea cancelar? Los cambios no guardados se perderán.')) {
      this.resetForm();
      this.goTable();
    }
  }
}
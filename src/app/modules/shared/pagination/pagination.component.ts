import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  totalPages = 1;
  visiblePages: (number | string)[] = [];
  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
    this.generateVisiblePages();
  }

  generateVisiblePages(): void {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Lógica de puntos suspensivos
      pages.push(1); // Siempre mostrar la primera

      if (current > 3) pages.push('...');

      // Mostrar páginas alrededor de la actual
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push('...');

      pages.push(total); // Siempre mostrar la última
    }
    this.visiblePages = pages;
  }

  changePage(page: any): void {
    if (page === '...') return;
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}

export abstract class PaginationBase {
  currentPage = 1;
  itemsPerPage = 4;
  // si se quiere usar un numero diferente de items, en la pagina en donde se importa poner: override itemsPerPage = X;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  /**
   * Método genérico para paginar cualquier array
   * @param items El array de datos
   */
  paginate<T>(items: T[]): T[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return items.slice(startIndex, startIndex + this.itemsPerPage);
  }
}

import { Component, OnInit } from '@angular/core';
import { EconodataAdminService, Data } from 'src/app/services/admin/econodata-admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationBase } from 'src/app/modules/shared/pagination-base';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-econodata-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent extends PaginationBase implements OnInit {

  dataList: Data[] = [];
  filteredData: Data[] = [];

  searchTerm = '';
  errorMessage = '';
  isLoading = true;

  override itemsPerPage = 10;
  constructor(
    private service: EconodataAdminService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
  }

  get pagedData(): Data[] {
    return this.paginate(this.filteredData);
  }

  async loadData() {
    try {
      this.isLoading = true;
      this.dataList = await this.service.getAll();
      this.filteredData = [...this.dataList];
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Error al cargar los recursos.';
    } finally {
      this.isLoading = false;
    }
  }

  searchData() {
    this.onSearchChange();
    const term = this.searchTerm.toLowerCase();

    this.filteredData = this.dataList.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  }

  createData() {
    this.router.navigate(['/admin/data/new']);
  }

  editData(item: Data) {
    this.router.navigate(['/admin/data/edit', item.id]);
  }

  async deleteData(item: Data) {
    if (!confirm(`¿Eliminar el recurso "${item.title}"?`)) return;

    try {
      await this.service.deleteData(item.id!);
      this.loadData();
    } catch (error) {
      console.error(error);
      this.notificationService.error('Error al eliminar.');
    }
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }
}

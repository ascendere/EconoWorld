import { Component, OnInit } from '@angular/core';
import { EconodataAdminService, Data } from 'src/app/services/admin/econodata-admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-econodata-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit {

  dataList: Data[] = [];
  filteredData: Data[] = [];

  searchTerm = '';
  errorMessage = '';
  isLoading = true;

  constructor(
    private service: EconodataAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
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
      alert('Error al eliminar.');
    }
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }
}

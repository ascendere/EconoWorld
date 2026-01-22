import { Component, OnInit } from '@angular/core';
import { EconodataService, data } from 'src/app/services/econodata.service';
import { NotificationService } from 'src/app/core/services/notification.service';

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-econodata',
  templateUrl: './econodata.component.html',
  styleUrls: ['./econodata.component.scss']
})
export class EconoDataComponent implements OnInit {

  // ================== FILTROS ==================
  searchText = '';
  selectedCategory = '';

  data: data[] = [];
  filtered: data[] = [];

  categories: string[] = [];

  loading = true;

  // ================== MODAL CSV / XLSX ==================
  showDataModal = false;
  selectedDataset?: data;

  previewHeaders: string[] = [];
  previewRows: any[] = [];

  constructor(private econodataService: EconodataService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.econodataService.getAll().subscribe(res => {
      this.data = res;
      this.filtered = res;

      // 🔹 Categorías dinámicas
      this.categories = Array.from(
        new Set(res.map(d => d.category).filter(Boolean))
      );

      this.loading = false;
    });
  }

  // ================== FILTROS ==================
  applyFilters(): void {
    this.filtered = this.data.filter(d => {
      const matchesCategory =
        !this.selectedCategory || d.category === this.selectedCategory;

      const searchLower = this.searchText.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        d.title.toLowerCase().includes(searchLower) ||
        (d.category && d.category.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });
  }

  setCategory(category: string): void {
    this.selectedCategory =
      this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  // ================== LINKS ==================
  openLink(url?: string) {
    if (!url) return;
    window.open(url, '_blank');
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================== DATASET PREVIEW ==================

  getFileType(url?: string): 'CSV' | 'XLSX' {
    if (!url) return 'CSV';
    return url.toLowerCase().includes('.xlsx') ? 'XLSX' : 'CSV';
  }

  async openDataModal(d: data) {
    if (!d.fileUrl) return;

    this.selectedDataset = d;
    this.previewHeaders = [];
    this.previewRows = [];

    try {
      const type = this.getFileType(d.fileUrl);
      const response = await fetch(d.fileUrl);
      const blob = await response.blob();

      if (type === 'CSV') {
        const text = await blob.text();
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true
        });

        this.previewRows = (parsed.data as any[]).slice(0, 50);
        this.previewHeaders = Object.keys(this.previewRows[0] || {});
      }

      if (type === 'XLSX') {
        const buffer = await blob.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        this.previewRows = (json as any[]).slice(0, 50);
        this.previewHeaders = Object.keys(this.previewRows[0] || {});
      }

      this.showDataModal = true;

    } catch (error) {
      console.error('Error cargando dataset:', error);
      this.notificationService.error('No se pudo cargar la vista previa del archivo');
    }
  }

  closeDataModal() {
    this.showDataModal = false;
    this.selectedDataset = undefined;
  }
}

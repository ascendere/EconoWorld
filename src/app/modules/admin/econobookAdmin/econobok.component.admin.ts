import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibrosService } from './libros.service'; // Asegúrate de ajustar el path si cambia
import { EconobookService } from 'src/app/services/econobook.service';

@Component({
  selector: 'app-econobook-admin',
  templateUrl: './econobok.component.admin.html',
  styleUrls: ['./econobok.component.admin.scss']
})
export class EconobookAdminComponent implements OnInit {
  libroForm!: FormGroup;

  portadaPreview: string | ArrayBuffer | null = null;
  archivoPDF: File | null = null;

  portadaUrl: string = '';
  pdfUrl: string = '';

  nivelRecomendacion = 0;

  constructor(
    private fb: FormBuilder,
    private librosService: LibrosService,
    private econobookService: EconobookService
  ) {}

  ngOnInit(): void {
    this.libroForm = this.fb.group({
      titulo: ['', Validators.required],
      autor: ['', Validators.required],
      editorial: ['', Validators.required],
      anio: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      descripcion: ['', Validators.required],
      estado: this.fb.group({
        borrador: [false],
        programarPublicacion: [false]
      }),
      opciones: this.fb.group({
        destacada: [false],
        comentarios: [false],
        boletin: [false]
      })
    });
  }

  async onPortadaSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = () => (this.portadaPreview = reader.result);
      reader.readAsDataURL(file);

      try {
        this.portadaUrl = await this.librosService.subirArchivo(file, 'portadas');
      } catch (error) {
        console.error('Error al subir la portada:', error);
      }
    }
  }

  async onPdfSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.archivoPDF = file;

      try {
        this.pdfUrl = await this.librosService.subirArchivo(file, 'pdfs');
      } catch (error) {
        console.error('Error al subir el PDF:', error);
      }
    }
  }

  setRecomendacion(nivel: number): void {
    this.nivelRecomendacion = nivel;
  }

  eliminarPortada(): void {
    this.portadaPreview = null;
    this.portadaUrl = '';
  }

  eliminarPDF(): void {
    this.archivoPDF = null;
    this.pdfUrl = '';
  }

  guardar(): void {
    if (this.libroForm.valid && this.portadaUrl && this.pdfUrl) {
      const libro = {
        ...this.libroForm.value,
        portadaUrl: this.portadaUrl,
        archivoPdfUrl: this.pdfUrl,
        recomendacion: this.nivelRecomendacion,
        creadoEn: new Date()
      };
      this.econobookService.addBook(libro).then(() => {
        alert('Libro guardado en la base de datos');
        this.libroForm.reset();
        this.portadaPreview = null;
        this.portadaUrl = '';
        this.archivoPDF = null;
        this.pdfUrl = '';
        this.nivelRecomendacion = 0;
      });
    } else {
      console.warn('Formulario inválido o archivos faltantes');
      this.libroForm.markAllAsTouched();
    }
  }

  guardarComoBorrador(): void {
    if (this.libroForm.valid) {
      const libro = {
        ...this.libroForm.value,
        portadaUrl: this.portadaUrl || '',
        archivoPdfUrl: this.pdfUrl || '',
        recomendacion: this.nivelRecomendacion,
        creadoEn: new Date(),
        estado: { ...this.libroForm.value.estado, borrador: true }
      };
      this.econobookService.addBook(libro).then(() => {
        alert('Borrador guardado');
        this.libroForm.reset();
        this.portadaPreview = null;
        this.portadaUrl = '';
        this.archivoPDF = null;
        this.pdfUrl = '';
        this.nivelRecomendacion = 0;
      });
    } else {
      console.warn('Formulario inválido');
      this.libroForm.markAllAsTouched();
    }
  }

  publicar(): void {
    this.guardar(); // Puedes agregar lógica extra si lo necesitas
  }
}

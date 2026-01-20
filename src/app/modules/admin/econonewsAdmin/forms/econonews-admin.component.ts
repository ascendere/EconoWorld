import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EcononewsAdminService, Noticia } from 'src/app/services/admin/econonews-admin.service';

@Component({
  selector: 'app-econonews-admin',
  templateUrl: './econonews-admin.component.html',
  styleUrls: ['./econonews-admin.component.scss']
})
export class EcononewsAdminComponent implements OnInit {

  form: FormGroup;
  editingId: string | null = null;
  isEditMode = false;
  // Configuración de TinyMCE
  public tinyMceConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image media table | ' +
      'forecolor backcolor | removeformat | help',
    menu: {
      edit: {
        title: 'Editar',
        items: 'undo redo | cut copy paste | selectall | searchreplace'
      },
      view: {
        title: 'Ver',
        items: 'code | visualaid visualchars visualblocks | preview fullscreen'
      },
      insert: {
        title: 'Insertar',
        items: 'link image media | template hr | anchor | insertdatetime'
      },
      format: {
        title: 'Formato',
        items: 'bold italic underline strikethrough superscript subscript | formats blockformats fontformats fontsizes align | forecolor backcolor | removeformat'
      },
      table: {
        title: 'Tabla',
        items: 'inserttable | cell row column | tableprops deletetable'
      },
      tools: {
        title: 'Herramientas',
        items: 'wordcount code'
      }
    },
    content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }',
    language: 'es',
    branding: false,
    statusbar: true
  };

  constructor(
    private fb: FormBuilder,
    private newsAdmin: EcononewsAdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      content: ['', Validators.required],
      keywords: this.fb.control<string[]>([]),
      resource: this.fb.group({
        name: [''],
        url: ['']
      })
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editingId = id;
      this.isEditMode = true;
      this.loadNews(id);
    }
  }

  addKeywordFromInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (event.code === 'Space' && value !== '') {
      this.addKeyword(value);
      input.value = '';
      event.preventDefault();
    }
  }

  addKeyword(word: string) {
    const list = this.form.get('keywords')?.value || [];

    if (!list.includes(word.toLowerCase())) {
      this.form.get('keywords')?.setValue([...list, word.toLowerCase()]);
    }
  }

  removeKeyword(word: string) {
    const list = this.form.get('keywords')?.value || [];
    this.form.get('keywords')?.setValue(list.filter((k: string) => k !== word));
  }

  async loadNews(id: string) {
    try {
      const noticia = await firstValueFrom(
        this.newsAdmin.getNewsById(id)
      );

      if (!noticia) {
        alert('Noticia no encontrada');
        this.router.navigate(['/admin/news']);
        return;
      }

      this.form.patchValue({
        title: noticia.title ?? '',
        category: noticia.category ?? '',
        content: noticia.content ?? '',
        keywords: noticia.keywords ?? [],
        resource: {
          name: noticia.resource?.name ?? '',
          url: noticia.resource?.url ?? ''
        }
      });

    } catch (error) {
      console.error('Error cargando noticia:', error);
      alert('Error al cargar la noticia');
      this.router.navigate(['/admin/news']);
    }
  }

  async saveNews() {
    if (this.form.invalid) {
      alert('Complete todos los campos obligatorios.');
      this.form.markAllAsTouched();
      return;
    }

    const data: Noticia = {
      title: this.form.value.title,
      category: this.form.value.category,
      content: this.form.value.content,
      keywords: this.form.value.keywords || [],
      resource: this.form.value.resource
    };

    try {

      if (this.editingId) {
        // EDITAR
        await this.newsAdmin.updateNews(this.editingId, data);
        alert('Noticia actualizada correctamente');
      } else {
        // CREAR
        await this.newsAdmin.createNews(data);
        alert('Noticia creada correctamente');
      }

      this.router.navigate(['/admin/news']);

    } catch (err) {
      console.error(err);
      alert('Error guardando la noticia');
    }
  }

  cancelar() {
    this.router.navigate(['/admin/news']);
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }

  goTable() {
    this.router.navigate(['/admin/news']);
  }
}

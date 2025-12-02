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
      resources: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editingId = id;
      this.loadNews(id);
    }
  }

  get resources() {
    return this.form.get('resources') as FormArray;
  }

  addResource() {
    this.resources.push(
      this.fb.group({
        name: ['', Validators.required],
        url: ['', Validators.required]
      })
    );
  }

  removeResource(i: number) {
    this.resources.removeAt(i);
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
      keywords: noticia.keywords ?? []
    });


    this.resources.clear();

    (noticia.resources ?? []).forEach((res: any) => {
      this.resources.push(
        this.fb.group({
          name: [res.name, Validators.required],
          url: [res.url, Validators.required]
        })
      );
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
      resources: this.form.value.resources
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

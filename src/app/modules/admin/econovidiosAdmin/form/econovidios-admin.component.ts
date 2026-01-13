import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EconovideosAdminService, Video } from 'src/app/services/admin/econovideos-admin.service';

@Component({
  selector: 'app-econovidios-admin',
  templateUrl: './econovidios-admin.component.html',
  styleUrls: ['./econovidios-admin.component.scss']
})
export class EconovidiosAdminComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  currentVideoId: string | null = null;

  authors: string[] = [];
  authorInput: string = '';

  videoUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private videosService: EconovideosAdminService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.currentVideoId = id;
      this.loadVideo(id);
    }
  }

  addAuthor() {
    const clean = this.authorInput.trim();
    if (!clean) return;

    this.authors.push(clean);
    this.authorInput = '';
  }

  removeAuthor(index: number) {
    this.authors.splice(index, 1);
  }

  async loadVideo(id: string) {
    try {
      const video = await firstValueFrom(this.videosService.getVideoById(id));

      if (!video) {
        alert('Video no encontrado');
        this.router.navigate(['/admin/videos']);
        return;
      }

      this.form.patchValue({
        title: video.title ?? '',
        category: video.category ?? '',
        description: video.description ?? '',
      });

      this.authors = [...(video.author ?? [])];

      if (video.videoUrl && video.videoUrl.url) {
        this.videoUrl = video.videoUrl.url;
      } else {
        this.videoUrl = '';
      }

    } catch (error) {
      console.error(error);
      alert('No se pudo cargar el video');
      this.router.navigate(['/admin/videos']);
    }
  }

  async save() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Complete todos los campos requeridos.');
      return;
    }

    if (this.authors.length === 0) {
      alert('Debe agregar al menos un autor.');
      return;
    }

    if (!this.videoUrl.trim()) {
      alert('Debe agregar el enlace del video.');
      return;
    }

    const data: Video = {
      title: this.form.value.title,
      category: this.form.value.category,
      description: this.form.value.description,
      author: [...this.authors],
      videoUrl: { name: 'link', url: this.videoUrl.trim() },
      createAt: new Date()
    };

    try {

      if (this.isEditMode && this.currentVideoId) {
        await this.videosService.updateVideo(this.currentVideoId, data);
        alert('Video actualizado con éxito.');
      } else {
        await this.videosService.addVideo(data);
        alert('Video creado exitosamente.');
      }

      this.goTable();

    } catch (err) {
      console.error(err);
      alert('Error al guardar el video.');
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  openVideo() {
    if (!this.videoUrl) return;
    window.open(this.videoUrl, "_blank");
  }

  autoGrow(event: any) {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  cancel() {
    if (confirm('¿Desea cancelar? Los cambios se perderán.')) {
      this.goTable();
    }
  }

  goTable() {
    this.router.navigate(['/admin/videos']);
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }
}

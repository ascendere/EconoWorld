import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EconoplayAdminService, Game } from 'src/app/services/admin/econoplay-admin.service';
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-econoplay-admin',
  templateUrl: './econopley-admin.component.html',
  styleUrls: ['./econopley-admin.component.scss']
})
export class EconoplayAdminComponent implements OnInit {

  form!: FormGroup;
  editingId: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private econoplayService: EconoplayAdminService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      createdAt: [{ value: '', disabled: true }],
      accessUrl: ['', Validators.required],
      instructions: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editingId = id;
      this.isEditMode = true;
      this.loadGame(id);
    } else {
      this.form.get('createdAt')?.setValue(new Date().toLocaleString());
    }
  }

  async loadGame(id: string) {
    try {
      const games = await firstValueFrom(this.econoplayService.getGames());
      const game = games.find((g: any) => g.id === id);

      if (!game) {
        alert('Game not found');
        this.goTable();
        return;
      }

      const createdAtFormatted = this.formatDate(game.createdAt);

      this.form.patchValue({
        name: game.name ?? '',
        category: game.category ?? '',
        createdAt: createdAtFormatted,
        accessUrl: game.accessUrl ?? '',
        instructions: game.instructions ?? ''
      });

    } catch (err) {
      console.error('Error loading game:', err);
      alert('Error loading game');
      this.goTable();
    }
  }

  private formatDate(value: any): string {
    if (!value) return '';

    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString();
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    return new Date(value).toLocaleString();
  }

  async saveGame() {
    if (this.form.invalid) {
      alert('Please complete all required fields.');
      this.form.markAllAsTouched();
      return;
    }

    try {
      let gameData: Partial<Game> = {
        name: this.form.value.name,
        category: this.form.value.category,
        instructions: this.form.value.instructions,
        accessUrl: this.form.value.accessUrl
      };

      // EDITAR
      if (this.editingId) {
        gameData.updatedAt = serverTimestamp();
        await this.econoplayService.updateGame(this.editingId, gameData);
        alert('Juego actualizado con éxito');
      }

      // CREAR NUEVO
      else {
        gameData.createdAt = serverTimestamp();
        await this.econoplayService.createGame(gameData as Game);
        alert('Juego creado con éxito');
      }

      this.goTable();

    } catch (err) {
      console.error('Error al guardar el juego:', err);
      alert('Error al guardar el juego.');
    }
  }

  cancel() {
    this.goTable();
  }

  goDashboard() {
    this.router.navigate(['/admin']);
  }

  goTable() {
    this.router.navigate(['/admin/play']);
  }
}

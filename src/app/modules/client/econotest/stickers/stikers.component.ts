import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StickersService } from 'src/app/services/stickers.service';
import { ThematicsService } from 'src/app/services/thematics.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-stikers',
  templateUrl: './stikers.component.html',
  styleUrls: ['./stikers.component.scss'],
})
export class StikersComponent implements OnInit, OnDestroy {
  user: any;
  stickers: any[] = [];
  thematics: any[] = [];
  thematicCromos: { [thematicId: string]: { total: number, ganados: number } } = {};
  selectedThematicId: string | null = null;
  selectedSticker: any;
  showSelectedSticker: boolean = false;
  totalStickers: number = 0;
  isFlipped: boolean = false;
  private unsubscribe$ = new Subject<void>();

  // Paginación
  currentPage: number = 1;
  stickersPerPage: number = 2;
  isPageTurningNext: boolean = false;
  isPageTurningPrev: boolean = false;

  constructor(
    private authService: AuthService,
    private stickersService: StickersService,
    private thematicsService: ThematicsService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.loadThematicsAndCromos();
    this.authService.currentUserObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        if (user && user.uid) {
          this.user = user;
          this.loadUserStickers(user.uid);
          this.currentPage = 1;
        } else {
          this.user = null;
          this.stickers = [];
        }
      });
  }

  async loadThematicsAndCromos() {
    this.thematicsService.getThematics().subscribe(async (thematics) => {
      this.thematics = thematics;
      for (const thematic of thematics) {
        const cardsSnap = await this.firestore.collection(`thematics/${thematic.id}/cards`).get().toPromise();
        const total = cardsSnap ? cardsSnap.size : 0;
        this.thematicCromos[thematic.id] = { total, ganados: this.thematicCromos[thematic.id]?.ganados || 0 };
      }
      // Refuerza la actualización de cromos ganados después de cargar temáticas
      this.updateCromosGanados(
        this.stickers.reduce((acc, t) => {
          acc[t.thematicId] = t.stickers;
          return acc;
        }, {} as any)
      );
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private updateCromosGanados(groupedStickers: any) {
    for (const thematicId in this.thematicCromos) {
      this.thematicCromos[thematicId].ganados = groupedStickers[thematicId]?.length || 0;
    }
  }

  loadUserStickers(userId: string): void {
    this.stickersService
      .getUserStickers(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          const groupedStickers = data.reduce((acc, sticker) => {
            const thematicId = sticker.thematicId;
            if (!acc[thematicId]) acc[thematicId] = [];
            acc[thematicId].push(sticker);
            return acc;
          }, {} as any);

          this.stickers = Object.keys(groupedStickers).map((thematicId) => ({
            thematicId,
            stickers: groupedStickers[thematicId],
          }));

          this.updateCromosGanados(groupedStickers);

          this.totalStickers = data.length;

          // Selecciona la primera temática por defecto
          if (this.thematics.length > 0 && !this.selectedThematicId) {
            this.selectedThematicId = this.thematics[0].id;
          }
        },
        (error) => {
          console.error('Error al cargar los stickers:', error);
          this.stickers = [];
          this.totalStickers = 0;
        }
      );
  }

  getFilteredStickers(): any[] {
    // Mostrar todos los cromos posibles de la temática seleccionada
    // (no solo los ganados)
    if (this.selectedThematicId) {
      // Buscar cromos ganados
      const thematic = this.stickers.find(t => t.thematicId === this.selectedThematicId);
      const ganados = thematic?.stickers || [];
      // Buscar todos los cromos posibles
      // (esto requiere que los hayas cargado en this.thematicCromos)
      // Aquí solo devolvemos los ganados para no romper la vista actual,
      // pero puedes combinar ambos si quieres mostrar todos (con opacidad para los no ganados)
      return ganados;
    } else {
      return this.stickers.flatMap(t => t.stickers || []);
    }
  }

  getCurrentPageStickers(): any[] {
    const allStickers = this.getFilteredStickers();
    const startIndex = (this.currentPage - 1) * this.stickersPerPage;
    return allStickers.slice(startIndex, startIndex + this.stickersPerPage);
  }

  getTotalPages(): number {
    const allStickers = this.getFilteredStickers();
    return Math.ceil(allStickers.length / this.stickersPerPage) || 1;
  }

  getCollectedStickerCount(): number {
    return this.getFilteredStickers().length;
  }

  async nextPage(): Promise<void> {
    if (this.currentPage < this.getTotalPages() && !this.isPageTurningNext) {
      this.isPageTurningNext = true;
      const pageElement = document.querySelector('.page') as HTMLElement;
      pageElement?.classList.add('turning');
      await new Promise((resolve) => setTimeout(resolve, 600));
      this.currentPage++;
      pageElement?.classList.remove('turning');
      this.isPageTurningNext = false;
    }
  }

  async prevPage(): Promise<void> {
    if (this.currentPage > 1 && !this.isPageTurningPrev) {
      this.isPageTurningPrev = true;
      const pageElement = document.querySelector('.page') as HTMLElement;
      pageElement?.classList.add('turning-back');
      await new Promise((resolve) => setTimeout(resolve, 600));
      this.currentPage--;
      pageElement?.classList.remove('turning-back');
      this.isPageTurningPrev = false;
    }
  }

  selectThematicId(thematicId: string | null): void {
    this.selectedThematicId = thematicId === 'null' ? null : thematicId;
    this.currentPage = 1;
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  showSticker(sticker: any): void {
    this.selectedSticker = sticker;
    this.showSelectedSticker = true;
    this.isFlipped = false;
  }

  hideSticker(): void {
    this.selectedSticker = null;
    this.showSelectedSticker = false;
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  getThematicsWithCromos(): any[] {
    return this.thematics.filter(t => (this.thematicCromos[t.id]?.ganados || 0) > 0);
  }
}

import { Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isOpen = false;
  isAuthenticated = false;
  userName = '';
  userRole = '';
  redirectAfterLogin = '/';
  currentRoute: string = '';
  tituloActual = 'EconoWorld';
  esLanding: boolean = false;
  private _redirigiendo = false;

  @ViewChild('loginModal') loginModal!: ElementRef;

  routeTitles: { [key: string]: string } = {
    '/econotest': 'EconoTest',
    '/econoplay': 'EconoPlay',
    '/econopley1': 'EconoPlay',
    '/econonews': 'EconoNews',
    '/econobook': 'EconoBook',
    '/econobot': 'EconoBot',
    '/econobook1': 'EconoBook',
    '/tematica': 'EconoTest',
    '/econovideos': 'EconoVideos',
    '/econovideos1': 'EconoVideos',
    '/econodata': 'EconoData',
    '/': 'EconoWorld',
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.checkAuthentication().subscribe((authenticated) => {
      this.isAuthenticated = authenticated;
      if (authenticated) {
        this.authService.getUser().subscribe((user) => {
          if (user) {
            this.userName = user.name || user.givenName || '';
            this.userRole = user.role || '';

            if (!this._redirigiendo) {
              const rutaActual = this.router.url;
              let destino = this.userRole === 'admin'
                ? '/admin'
                : this.redirectAfterLogin || '/';
              if (rutaActual !== destino && !rutaActual.startsWith(destino)) {
                this._redirigiendo = true;
                this.router.navigate([destino]).then(() => {
                  this._redirigiendo = false;
                });
              }
            }

            this.closeLoginModal();
            this.closeAuthPopup();
          }
        });
      }
    });

    this.authService.loginModalTrigger$.subscribe((redirectTo) => {
      if (redirectTo) {
        this.openLoginModal(redirectTo);
        this.authService.clearLoginModalTrigger();
      }
    });

    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        
        // Solo actualiza título y landing, no redirige aquí
        const match = Object.keys(this.routeTitles).find((key) =>
          event.urlAfterRedirects.startsWith(key)
        );
        this.tituloActual = match ? this.routeTitles[match] : 'EconoWorld';
        this.esLanding = event.urlAfterRedirects === '/';
      });
  }

  ngOnDestroy(): void {
    this.authService.ngOnDestroy();
  }

  private loadUser(): void {
    this.authService.getUser().subscribe((user) => {
      if (user) {
        this.userName = user.name || user.givenName || '';
        this.userRole = user.role || '';
        this.closeLoginModal();
        this.closeAuthPopup();
      }
    });
  }

  openLoginModal(redirectTo: string = '/econotest'): void {
    this.redirectAfterLogin = redirectTo;
    if (this.loginModal?.nativeElement) {
      this.loginModal.nativeElement.style.display = 'block';
    }
  }

  closeLoginModal(): void {
    if (this.loginModal?.nativeElement) {
      this.loginModal.nativeElement.style.display = 'none';
    }
  }

  signIn(provider: string): void {
    const signInMethod = provider === 'ms'
      ? this.authService.signInWithMicrosoft()
      : this.authService.signInWithGoogle();

    signInMethod
      .then((user) => {
        if (user) {
          this.userName = user.name || user.givenName || '';
          this.userRole = user.role || '';

          // NO redirigir aquí, dejar que ngOnInit maneje la redirección
          // La redirección se manejará automáticamente en ngOnInit cuando se detecte el cambio de autenticación

          this.closeLoginModal();
          this.closeAuthPopup();
        }
      })
      .catch((error) => console.error('Error al iniciar sesión:', error));
  }

  signOut(): void {
    this.authService.signOut();
    this.isAuthenticated = false;
    this.userName = '';
    this.userRole = '';
    if (this.userRole === 'admin' && this.currentRoute.startsWith('/admin')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private getRedirectUrl(originalPath: string): string {
    console.log('Ruta original:', originalPath);

    if (this.userRole === 'admin') {
      // Para admin, siempre redirigir a /admin/tematicas como página principal
      if (originalPath === '/econotest' || originalPath === '/tematica') {
        return '/admin/tematicas';
      }
      if (originalPath === '/econobook') {
        return '/admin/econobookadmin';
      }
      if (originalPath === '/econonews') {
        return '/admin/econonewsadmin';
      }
      if (originalPath === '/econoplay') {
        return '/admin/econopleyadmin';
      }
      if (originalPath === '/econovideos') {
        return '/admin/econovidiosadmin';
      }
      // Si ya está en /admin o subrutas, no redirigir
      if (originalPath.startsWith('/admin')) {
        return originalPath;
      }
      // Para cualquier otra ruta, ir a admin
      return '/admin/tematicas';
    }

    // Si el usuario NO es admin y está en /admin, redirigir a /tematica
    if (originalPath.startsWith('/admin')) {
      return '/tematica';
    }

    // Si no, dejarlo en su ruta original
    return originalPath;
  }

  private closeAuthPopup(): void {
    if (window.opener) {
      window.opener.postMessage({ type: 'auth_success' }, '*');
    }
  }

  public navegar(ruta: string): void {
    // Evitar redirecciones múltiples verificando si ya estamos en la ruta correcta
    const destino = this.getRedirectUrl(ruta);
    const rutaActual = this.router.url;
    
    if (rutaActual !== destino && !rutaActual.startsWith(destino)) {
      console.log('Navegando a:', destino);
      this.router.navigate([destino]);
    } else {
      console.log('Ya estamos en la ruta correcta:', rutaActual);
    }
  }

  navigateToHome(): void {
    this.navegar('/tematica');
  }

  navigateToStickers(): void {
    this.navegar('/tematica/cromos');
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  get mostrarNombre(): boolean {
    return this.isAuthenticated && (
      this.currentRoute.startsWith('/econotest') ||
      this.currentRoute.startsWith('/tematica')
    );
  }

  get mostrarAlbum(): boolean {
    return this.isAuthenticated &&
      this.currentRoute.startsWith('/tematica/') &&
      !this.currentRoute.includes('/cromos');
  }

  isRutaGeneral(): boolean {
    const rutas = [
      '/econoplay',
      '/econonews',
      '/econobook',
      '/econobot',
      '/econobook1',
      '/econopley1',
      '/tematica',
      '/econovideos',
      '/econovideos1', // <-- Agregado para mostrar enlaces generales en /econovideos1
      '/econodata',
    ];
    return rutas.some(ruta => this.currentRoute.startsWith(ruta)) && this.isAuthenticated;
  }
}

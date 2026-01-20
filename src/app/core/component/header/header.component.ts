import { Component, ElementRef, OnDestroy, ViewChild, OnInit, HostListener } from '@angular/core';
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
  isAdmin: boolean = false;
  userName = '';
  userRole = '';
  redirectAfterLogin = '/';
  currentRoute: string = '';
  tituloActual = 'EconoWorld';
  forzarVistaUsuario: boolean = false;
  esLanding: boolean = false;
  private _redirigiendo = false;

  isServiciosOpen = false;

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

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const role = localStorage.getItem('userRole');
    this.authService.checkAuthentication().subscribe((authenticated) => {
      this.isAuthenticated = authenticated;
      if (authenticated) {
        this.authService.getUser().subscribe((user) => {
          if (user) {
            this.userName = user.name || user.givenName || '';
            this.userRole = user.role || '';
            this.isAdmin = this.userRole === 'admin';

            // lista de rutas permitidas para admins
            const rutasPermitidasParaAdmin = [
              '/',
              '/econobook',
              '/econovideos',
              '/econonews',
              '/econoplay',
              '/econodata',
              '/econobot',
              '/tematica'
            ];

            if (!this._redirigiendo && !this.forzarVistaUsuario) {
              const rutaActual = this.router.url;

              // Verificar si es una ruta permitida para admins
              const esRutaPermitida = rutasPermitidasParaAdmin.some(ruta =>
                rutaActual.startsWith(ruta)
              );

              // Solo redirigir si NO es una ruta permitida
              if (!esRutaPermitida) {
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

        this.isServiciosOpen = false;

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

          this.closeLoginModal();
          this.closeAuthPopup();
        }
      })
      .catch((error) => console.error('Error al iniciar sesión:', error));
  }

  signOut(): void {
    this.forzarVistaUsuario = false;
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
      if (originalPath.startsWith('/admin')) {
        return originalPath;
      }
      return '/admin/tematicas';
    }

    if (originalPath.startsWith('/admin')) {
      return '/tematica';
    }

    return originalPath;
  }

  private closeAuthPopup(): void {
    if (window.opener) {
      window.opener.postMessage({ type: 'auth_success' }, '*');
    }
  }

  public navegar(ruta: string): void {
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
    this.router.navigate(['/tematica/cromos']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  toggleServiciosMenu(): void {
    this.isServiciosOpen = !this.isServiciosOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.servicios-dropdown')) {
      this.isServiciosOpen = false;
    }
  }

  get mostrarNombre(): boolean {
    return this.isAuthenticated && (
      this.currentRoute.startsWith('/econotest') ||
      this.currentRoute.startsWith('/tematica')
    );
  }

  get mostrarAlbum(): boolean {
    return this.isAuthenticated &&
      this.currentRoute.startsWith('/tematica')
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
      '/econovideos1',
      '/econodata',
    ];
    return rutas.some(ruta => this.currentRoute.startsWith(ruta)) && this.isAuthenticated;
  }
}

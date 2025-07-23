import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  estaAutenticado: boolean = false;
  servicioActivo: string = '';
  userRole: string = '';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUserObservable.subscribe(user => {
      this.estaAutenticado = !!user;
      this.userRole = user?.role ?? '';
      if (this.userRole === 'admin') {
        this.router.navigate(['/admin']);
      }
    });
  }

  /**
   * Navega directamente a la ruta si el usuario está autenticado,
   * o abre el modal de login si no lo está.
   */
  navegar(ruta: string): void {
    if (this.estaAutenticado) {
      this.router.navigate([ruta]);
    } else {
      this.authService.triggerLoginModal(ruta);
    }
  }

  /**
   * Selecciona un servicio y navega según el rol.
   */
  seleccionarServicio(nombre: string): void {
    this.servicioActivo = nombre;

    if (!this.estaAutenticado) {
      this.authService.triggerLoginModal(`/${nombre}`);
      return;
    }

    // Redirige al módulo según el rol de forma directa
    if (this.userRole === 'admin') {
      // Admin va directo a /admin/tematicas
      this.router.navigate(['/admin/tematicas']);
    } else {
      // Usuarios normales van directo a /nombre
      this.router.navigate([`/${nombre}`]);
    }
  }

  /**
   * Redirige según el rol del usuario a la vista correcta de un servicio
   */
  redirigirSegunRol(servicio: string): void {
    if (!this.estaAutenticado) {
      this.authService.triggerLoginModal(`/${servicio}`);
      return;
    }

    // Para admin, redirigir a /admin/tematicas, para otros a /servicio
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin/tematicas']);
    } else {
      this.router.navigate([`/${servicio}`]);
    }
  }
}

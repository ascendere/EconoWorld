import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanMatch,
  Route,
  UrlSegment,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of, map, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanMatch, CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  private redirectIfNotAuthenticated(stateUrl?: string): Observable<boolean> {
    return this.authService.checkAuthentication().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.authService.triggerLoginModal(stateUrl || '/'); // Muestra el modal de login
          return false;
        }
        return true;
      })
    );
  }

  private checkUserRole(expectedRole: string): Observable<boolean> {
    return this.authService.getUser().pipe(
      switchMap((user: any) => {
        if (!user) {
          this.router.navigate(['/']); // Redirige si no hay usuario
          return of(false);
        }

        const userRole = user.role || '';
        
        // Si se espera rol vacío (client), verificar que NO sea admin
        if (expectedRole === '' && userRole === 'admin') {
          this.router.navigate(['/admin/tematicas']); // Redirige admin a su área específica
          return of(false);
        }
        
        // Si se espera rol admin, verificar que sea admin
        if (expectedRole === 'admin' && userRole !== 'admin') {
          this.router.navigate(['/tematica']); // Redirige client a su área
          return of(false);
        }
        
        return of(true); // Permite la navegación si el rol es válido
      })
    );
  }

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean> {
    // Primero verificamos si el usuario está autenticado
    const url = '/' + segments.map(s => s.path).join('/');
    return this.redirectIfNotAuthenticated(url);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const expectedRole = route.data['expectedRole']; // Obtiene el rol esperado de los datos de la ruta

    if (expectedRole !== undefined) {
      // Si se espera un rol específico, verificamos si el usuario tiene ese rol
      return this.checkUserRole(expectedRole);
    } else {
      // Si no se especifica rol, solo comprobamos la autenticación
      return this.redirectIfNotAuthenticated(state.url);
    }
  }
}

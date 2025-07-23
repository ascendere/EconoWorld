import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Observable, from, of, BehaviorSubject, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private _authenticated = new BehaviorSubject<boolean>(false);
  private _currentUserSubject = new BehaviorSubject<any>(null);
  private _unsubscribeAll = new Subject();
  private readonly SESSION_TOKEN_KEY = 'sessionToken';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        if (user) {
          this.handleUserLogin(user);
        } else {
          this.handleUserLogout();
        }
      });
  }

  private handleUserLogin(user: any): void {
    this._authenticated.next(true);
    this._currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem(this.SESSION_TOKEN_KEY, this.generateSessionToken());
    console.log('Usuario autenticado:', user);  // Log para depuración
  }

  private handleUserLogout(): void {
    this._authenticated.next(false);
    this._currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
    console.log('Usuario desconectado');  // Log para depuración
  }

  checkAuthentication(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.firestore
            .collection('users')
            .doc(user.uid)
            .valueChanges()
            .pipe(
              map(() => true),
              catchError(() => of(false))
            );
        } else {
          return of(false);
        }
      }),
      catchError(() => of(false))
    );
  }

  getUser(): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap((user) =>
        user
          ? this.firestore.doc<any>(`users/${user.uid}`).valueChanges()
          : of(null)
      )
    );
  }

  signInWithGoogle(): Promise<any> {
    return this.signInWithProvider(new firebase.auth.GoogleAuthProvider());
  }

  signInWithMicrosoft(): Promise<any> {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');
    provider.addScope('user.read');
    return this.signInWithProvider(provider);
  }

  private signInWithProvider(provider: any): Promise<any> {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        const user = result?.user;
        if (user) {
          return this.firestore
            .collection('users')
            .doc(user.uid)
            .get()
            .toPromise()
            .then((existingUser) => {
              if (existingUser && existingUser.exists) {
                const userData = existingUser.data() as { [key: string]: any };
                return this.firestore
                  .collection('users')
                  .doc(user.uid)
                  .set(
                    {
                      ...userData,
                      registrationDate: new Date(),
                    },
                    { merge: true }
                  )
                  .then(() => user);
              } else {
                return this.firestore
                  .collection('users')
                  .doc(user.uid)
                  .set({
                    ...result.additionalUserInfo?.profile,
                    registrationDate: new Date(),
                    role: '',
                  })
                  .then(() => user);
              }
            });
        } else {
          throw new Error('No se pudo obtener el usuario');
        }
      })
      .catch((error) => {
        console.error('Error al iniciar sesión:', error);
        throw error;
      });
  }

  signOut(): void {
    this.afAuth
      .signOut()
      .then(() => {
        this.handleUserLogout(); // ✅ Limpia estados locales
        this.router.navigate(['/']); // ✅ Redirección opcional
      })
      .catch((error) => console.error('Error al cerrar sesión:', error));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private generateSessionToken(): string {
    return `${Date.now()}`;
  }

  get currentUserObservable(): Observable<any> {
    return this._currentUserSubject.asObservable();
  }

  updateUserRole(userId: string, newRole: string): Promise<void> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .set({ role: newRole }, { merge: true });
  }

  // ✅ Nueva sección para manejar el modal de login de forma global
  private loginModalTrigger = new BehaviorSubject<string | null>(null);
  loginModalTrigger$ = this.loginModalTrigger.asObservable();

  triggerLoginModal(redirectTo: string): void {
    this.loginModalTrigger.next(redirectTo);
  }

  clearLoginModalTrigger(): void {
    this.loginModalTrigger.next(null);
  }
}

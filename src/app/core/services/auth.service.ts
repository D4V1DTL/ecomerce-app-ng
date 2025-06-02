import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Replace with your actual API URL

  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  constructor(private http: HttpClient) {
    this.loadAuthStateFromStorage();
  }

  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoadingState(true);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => this.handleAuthSuccess(response)),
        catchError((error) => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.setLoadingState(true);

    // In a real application
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
      })
      .pipe(
        tap((response) => this.handleAuthSuccess(response)),
        catchError((error) => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        // Limpia el estado local después de cerrar sesión en el backend
        localStorage.removeItem('auth_token');
        this.authState.next({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        location.href = '/'; // Redirige al inicio o login
      },
      error: () => {
        // Incluso si falla la petición, limpia el estado local
        localStorage.removeItem('auth_token');
        this.authState.next({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        location.href = '/';
      },
    });
  }

  getToken(): string | null {
    return this.authState.value.token;
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    this.authState.next({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      loading: false,
      error: null,
    });
  }

  private handleAuthError(error: any): void {
    this.authState.next({
      ...this.authState.value,
      loading: false,
      error: error.message || 'Authentication failed',
    });
  }

  private setLoadingState(loading: boolean): void {
    this.authState.next({
      ...this.authState.value,
      loading,
      error: null,
    });
  }

  private loadAuthStateFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const currentState = this.authState.value;

    if (token && !currentState.user) {
      // Si hay token, consulta /me para obtener el usuario
      this.http.get<AuthResponse>(`${this.apiUrl}/me`).subscribe(
        (res) => {
          this.authState.next({
            user: res.user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        },
        (error) => {
          this.authState.next({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || 'No autenticado',
          });
          //localStorage.removeItem('auth_token');
        }
      );
    }
  }
}

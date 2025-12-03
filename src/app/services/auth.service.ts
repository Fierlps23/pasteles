import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface LoginResponse {
  id: number;
  email: string;
  first_name: string;
  role: string;
  email_verified: boolean;
}

interface ApiLoginResponse {
  user?: LoginResponse;
  message?: string;
  token?: string;
}

interface RegisterResponse {
  message: string;
  verification_token: string;
}

interface ResetResponse {
  message: string;
  reset_url?: string; // ✅ agregado para compatibilidad con ForgotPasswordComponent
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 🔧 Cambiado: "usuarios" → "users"
  private apiUrl = 'http://localhost:5000/api/users';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): LoginResponse | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<ApiLoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(response => {
          if (response.user) {
            return response.user;
          }
          // Si no hay 'user' en la respuesta, crear un usuario temporal
          const tempId = Array.from(email).reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return {
            id: tempId,
            email: email,
            first_name: email.split('@')[0],
            role: 'user',
            email_verified: false
          };
        }),
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(userData: {
    email: string;
    password: string;
    first_name: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData);
  }

  verifyEmail(token: string, email: string): Observable<{message: string}> {
    return this.http.get<{message: string}>(`${this.apiUrl}/verify_email`, {
      params: { token, email }
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  requestPasswordReset(email: string): Observable<ResetResponse> {
    return this.http.post<ResetResponse>(`${this.apiUrl}/reset-password`, { email });
  }

  resetPassword(token: string, password: string, email: string): Observable<ResetResponse> {
    return this.http.put<ResetResponse>(`${this.apiUrl}/reset-password`, { token, password, email });
  }
}

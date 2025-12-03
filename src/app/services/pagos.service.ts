import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface PreferenciaPago {
  id: string;
  init_point: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  // 🔥 La URL correcta es /api — ya NO se debe incluir /user
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  crearPreferenciaPago(): Observable<PreferenciaPago> {
    const usuario = this.authService.getCurrentUser();

    if (!usuario || !usuario.id) {
      // Si no hay sesión activa, redirige
      window.location.href = '/login';
      throw new Error('Usuario no autenticado');
    }

    // 🔥 Llamada CORRECTA: /api/crear-preferencia
    return this.http.post<PreferenciaPago>(
      `${this.apiUrl}/crear-preferencia`,
      { 
        usuario_id: usuario.id,
        timestamp: Date.now()  // Evita cache del navegador
      }
    ).pipe(
      tap((response: PreferenciaPago) => {
        if (!response || !response.init_point) {
          throw new Error('Respuesta inválida del servidor de pagos');
        }
      })
    );
  }
}

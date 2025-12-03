import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="reset-wrapper">
    <div class="reset-card">
      <div class="header">
        <div class="icon">🧁</div>
        <h2>Establecer Nueva Contraseña</h2>
        <p class="subtitle">Restablece tu acceso a <b>Dulce Tentación</b></p>
      </div>

      <!-- FORMULARIO -->
      <div *ngIf="!resetComplete" class="form-container">
        <form (ngSubmit)="onSubmit()" #resetForm="ngForm">
          <div class="form-group">
            <label for="password">🔒 Nueva Contraseña</label>
            <input 
              type="password" 
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="8"
              #passwordInput="ngModel"
              class="input">
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error-message">
              La contraseña debe tener al menos 8 caracteres
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">🔁 Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              #confirmInput="ngModel"
              class="input">
            <div *ngIf="password !== confirmPassword && confirmInput.touched" class="error-message">
              Las contraseñas no coinciden
            </div>
          </div>
          
          <button 
            type="submit" 
            [disabled]="resetForm.invalid || isSubmitting || password !== confirmPassword"
            class="button">
            {{ isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña' }}
          </button>
        </form>
      </div>

      <!-- MENSAJE DE ÉXITO -->
      <div *ngIf="resetComplete" class="success-message">
        <div class="success-icon">🎉</div>
        <p>¡Tu contraseña ha sido actualizada exitosamente!</p>
        <button (click)="goToLogin()" class="back-btn">Ir al Login</button>
      </div>

      <!-- ERROR -->
      <div *ngIf="error" class="error">
        ⚠️ {{ error }}
      </div>
    </div>
  </div>
  `,
  styles: [`
  .reset-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffe5ec, #fff8f8, #fce7f3);
    font-family: 'Poppins', sans-serif;
    padding: 20px;
  }

  .reset-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 22px;
    box-shadow: 0 8px 25px rgba(255, 182, 193, 0.3);
    padding: 40px 35px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .header .icon {
    font-size: 55px;
    margin-bottom: 10px;
    animation: bounce 1.5s infinite ease-in-out;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  h2 {
    font-size: 26px;
    font-weight: 700;
    color: #d6336c;
    margin-bottom: 5px;
  }

  .subtitle {
    font-size: 14px;
    color: #a44d6a;
    margin-bottom: 25px;
  }

  .form-group {
    text-align: left;
    margin-bottom: 20px;
  }

  label {
    font-size: 14px;
    font-weight: 600;
    color: #b83265;
    margin-bottom: 5px;
    display: block;
  }

  .input {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1.5px solid #f9c5d1;
    background: #fffafc;
    font-size: 15px;
    color: #6b3d4f;
    outline: none;
    transition: 0.3s ease;
  }

  .input:focus {
    border-color: #f58fb6;
    box-shadow: 0 0 0 3px rgba(245, 143, 182, 0.25);
  }

  .error-message {
    font-size: 12px;
    color: #d43f5e;
    margin-top: 5px;
  }

  .button {
    width: 100%;
    background: linear-gradient(135deg, #f58fb6, #fbcfe8);
    border: none;
    padding: 12px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(245, 143, 182, 0.3);
  }

  .button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .success-icon {
    font-size: 55px;
    margin-bottom: 10px;
    color: #f58fb6;
  }

  .success-message {
    font-size: 16px;
    color: #7a405c;
  }

  .back-btn {
    margin-top: 20px;
    border: 2px solid #f58fb6;
    background: transparent;
    color: #f58fb6;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    transition: 0.3s;
  }

  .back-btn:hover {
    background: #f58fb6;
    color: white;
  }

  .error {
    margin-top: 15px;
    background: #ffe5ec;
    border-left: 4px solid #ff7991;
    color: #b83265;
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
  }

  @media (max-width: 600px) {
    .reset-card {
      padding: 25px 20px;
    }
  }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  email: string | null = null;
  password: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  resetComplete: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email');
    if (!this.token || !this.email) {
      this.error = 'Token o email inválido o faltante';
    }
  }

  onSubmit() {
    if (!this.token || !this.email || !this.password || this.password !== this.confirmPassword) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.authService.resetPassword(this.token, this.password, this.email).subscribe({
      next: () => {
        this.resetComplete = true;
        this.isSubmitting = false;
      },
      error: () => {
        this.error = 'Error al actualizar la contraseña. El token puede haber expirado.';
        this.isSubmitting = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

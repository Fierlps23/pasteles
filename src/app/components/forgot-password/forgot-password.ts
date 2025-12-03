import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="forgot-wrapper">
    <div class="forgot-card">
      <div class="header">
        <div class="icon">🍰</div>
        <h1>Restablecer Contraseña</h1>
        <p class="subtitle">Recupera el acceso a tu cuenta de <b>Dulce Tentación</b></p>
      </div>

      <!-- FORMULARIO -->
      <form (ngSubmit)="onSubmit()" *ngIf="!emailSent" class="form">
        <p class="instructions">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div class="form-group">
          <label for="email">📧 Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            class="input"
            [(ngModel)]="email"
            placeholder="tu@email.com"
            required
            email
            #emailInput="ngModel">
          <div *ngIf="emailInput.invalid && emailInput.touched" class="error-message">
            Por favor, ingresa un correo válido.
          </div>
        </div>

        <button type="submit" [disabled]="isSubmitting" class="button">
          {{ isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación' }}
        </button>

        <div class="back-login">
          <a routerLink="/login">← Volver al login</a>
        </div>
      </form>

      <!-- MENSAJE DE ÉXITO -->
      <div *ngIf="emailSent" class="success">
        <div class="success-icon">💌</div>
        <h2>¡Correo Enviado!</h2>
        <p>Si el correo existe, recibirás un enlace para restablecer tu contraseña.</p>

        <div *ngIf="resetUrl" class="reset-box">
          <p class="note">🔧 Enlace de prueba:</p>
          <a [href]="resetUrl" class="reset-btn">Abrir enlace</a>
          <p class="small">O copia este enlace:</p>
          <code>{{ resetUrl }}</code>
        </div>

        <p class="check">Revisa tu bandeja de entrada o carpeta de spam.</p>
        <button (click)="goBack()" class="back-btn">Volver al Login</button>
      </div>

      <!-- ERROR -->
      <div *ngIf="error" class="error">
        ⚠️ {{ error }}
      </div>
    </div>
  </div>
  `,
  styles: [`
  .forgot-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fce7f3, #ffe5ec, #fff8f8);
    font-family: 'Poppins', sans-serif;
    padding: 20px;
  }

  .forgot-card {
    background: rgba(255, 255, 255, 0.9);
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

  .header h1 {
    font-size: 26px;
    font-weight: 700;
    color: #d6336c;
  }

  .subtitle {
    font-size: 14px;
    color: #a44d6a;
    margin-bottom: 25px;
  }

  .instructions {
    color: #7a405c;
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .form-group {
    text-align: left;
    margin-bottom: 20px;
  }

  .form-group label {
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

  .back-login {
    margin-top: 15px;
  }

  .back-login a {
    font-size: 14px;
    color: #c2527c;
    text-decoration: none;
  }

  .back-login a:hover {
    text-decoration: underline;
  }

  .success {
    color: #7a405c;
  }

  .success-icon {
    font-size: 50px;
    margin-bottom: 10px;
  }

  .reset-box {
    background: #fff0f5;
    padding: 15px;
    border-radius: 10px;
    margin-top: 15px;
  }

  .reset-btn {
    display: inline-block;
    margin-top: 8px;
    background: #f58fb6;
    color: white;
    text-decoration: none;
    padding: 8px 15px;
    border-radius: 8px;
    transition: 0.3s;
  }

  .reset-btn:hover {
    background: #ec6d9a;
  }

  .note {
    color: #a44d6a;
    font-size: 13px;
  }

  .small {
    font-size: 12px;
    color: #9e6784;
  }

  code {
    display: block;
    background: #fff;
    border: 1px solid #fbcfe8;
    padding: 6px;
    border-radius: 6px;
    margin-top: 6px;
    color: #b83265;
    font-size: 12px;
    word-break: break-all;
  }

  .check {
    margin-top: 20px;
    font-size: 14px;
    color: #a44d6a;
  }

  .back-btn {
    margin-top: 15px;
    border: 2px solid #f58fb6;
    background: transparent;
    color: #f58fb6;
    padding: 8px 20px;
    border-radius: 8px;
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
    .forgot-card {
      padding: 25px 20px;
    }
  }
  `]
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitting: boolean = false;
  emailSent: boolean = false;
  error: string | null = null;
  resetUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email) return;
    
    this.isSubmitting = true;
    this.error = null;

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response: any) => {
        this.emailSent = true;
        this.isSubmitting = false;
        if (response.token) {
          this.resetUrl = `${window.location.origin}/reset-password?token=${response.token}&email=${encodeURIComponent(this.email)}`;
        }
      },
      error: () => {
        this.error = 'Error al procesar la solicitud. Por favor, intenta nuevamente.';
        this.isSubmitting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}

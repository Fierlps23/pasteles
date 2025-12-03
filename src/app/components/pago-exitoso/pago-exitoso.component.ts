import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-result success">
      <h2>¡Pago Exitoso!</h2>
      <p>Tu pedido ha sido procesado correctamente.</p>
      <button (click)="volverAInicio()" class="btn-primary">Volver al inicio</button>
    </div>
  `,
  styles: [`
    .payment-result {
      text-align: center;
      padding: 40px;
      max-width: 600px;
      margin: 40px auto;
      border-radius: 8px;
    }
    .success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .btn-primary {
      background-color: #2e7d32;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    }
  `]
})
export class PagoExitosoComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  volverAInicio(): void {
    this.router.navigate(['/']);
  }
}
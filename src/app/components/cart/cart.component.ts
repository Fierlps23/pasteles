import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { PagosService } from '../../services/pagos.service';
import { Observable } from 'rxjs';

// Declaración global para TypeScript
declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-container">
      <h2>🛒 Carrito de Compras</h2>
      
  <div *ngIf="((cart$ | async)?.length ?? 0) === 0" class="empty-cart">
        <p>Tu carrito está vacío</p>
        <button (click)="continueShopping()" class="continue-shopping">Continuar Comprando</button>
      </div>

  <div *ngIf="((cart$ | async)?.length ?? 0) > 0" class="cart-items">
        <div *ngFor="let item of cart$ | async" class="cart-item">
          <div class="item-image" *ngIf="item.image">
            <img [src]="item.image" [alt]="item.name">
          </div>
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p *ngIf="item.description">{{ item.description }}</p>
            <p class="price">\${{ item.price }}</p>
          </div>
          <div class="item-quantity">
            <button (click)="updateQuantity(item.id, item.quantity - 1)" class="quantity-btn">-</button>
            <input type="number" [value]="item.quantity" 
                   (change)="updateQuantity(item.id, $any($event.target).value)"
                   min="1" class="quantity-input">
            <button (click)="updateQuantity(item.id, item.quantity + 1)" class="quantity-btn">+</button>
          </div>
          <div class="item-total">
            \${{ item.price * item.quantity }}
          </div>
          <button (click)="removeItem(item.id)" class="remove-btn">🗑️</button>
        </div>

        <div class="cart-summary">
            <div class="summary-row">
            <span>Subtotal:</span>
            <span>\${{ total$ | async }}</span>
          </div>
          <div class="summary-row">
            <span>IVA (16%):</span>
            <span>\${{ ((total$ | async) ?? 0) * 0.16 | number:'1.2-2' }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>\${{ ((total$ | async) ?? 0) * 1.16 | number:'1.2-2' }}</span>
          </div>
          
          <div class="cart-actions">
            <button (click)="clearCart()" class="clear-cart">Vaciar Carrito</button>
            <button (click)="checkout()" class="checkout">Proceder al Pago</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .empty-cart {
      text-align: center;
      padding: 40px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: auto 1fr auto auto auto;
      gap: 20px;
      padding: 20px;
      border-bottom: 1px solid #eee;
      align-items: center;
    }

    .item-image img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quantity-input {
      width: 60px;
      text-align: center;
      padding: 5px;
    }

    .quantity-btn {
      padding: 5px 10px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
    }

    .remove-btn {
      padding: 5px 10px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 1.2em;
    }

    .cart-summary {
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
    }

    .total {
      font-size: 1.2em;
      font-weight: bold;
      border-top: 2px solid #ddd;
      margin-top: 10px;
      padding-top: 10px;
    }

    .cart-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .checkout {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .clear-cart {
      padding: 10px 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .continue-shopping {
      padding: 10px 20px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class CartComponent implements OnInit {
  cart$: Observable<CartItem[]>;
  total$: Observable<number>;
  mp: any;

  constructor(
    private cartService: CartService,
    private pagosService: PagosService
  ) {
    this.cart$ = this.cartService.cart$;
    this.total$ = this.cartService.total$;
  }

  ngOnInit(): void {
    // Cargar el SDK de MercadoPago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      this.mp = new window.MercadoPago('TEST-e04e7fc3-32ed-4d21-97f8-aa2e806d9c89'); // Clave pública de prueba
    };
    document.body.appendChild(script);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, Number(quantity));
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    this.pagosService.crearPreferenciaPago().subscribe({
      next: (response) => {
        window.location.href = response.init_point;
      },
      error: (error) => {
        console.error('Error al crear preferencia de pago:', error);
        alert('Error al procesar el pago. Por favor, intenta nuevamente.');
      }
    });
  }

  continueShopping(): void {
    window.history.back();
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { ProductosService, Producto } from './productos.service';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  private authSub: Subscription | null = null;
  private currentUser: any = null;
  private apiUrl = 'http://localhost:5000/api'; // URL base de la API

  cart$ = this.cartSubject.asObservable();
  total$ = this.totalSubject.asObservable();

  constructor(private authService: AuthService, private http: HttpClient, private productosService: ProductosService) {
    // Inicializar usuario actual (si hay) y suscribir a cambios de sesión
    this.currentUser = this.authService.getCurrentUser();

    // Si no hay usuario, no cargamos carrito persistente (queremos que el carrito sea por usuario)
    if (this.currentUser) {
      this.loadCart();
    } else {
      // Asegurar que versiones antiguas no persistan un 'cart' global
      try { localStorage.removeItem('cart'); } catch (e) {}
    }

    this.authSub = this.authService.currentUser$.subscribe(u => {
      // Cuando cambia la sesión
      const oldUserId = this.currentUser?.id;
      
      if (u) {
        // Si se loguea un usuario
        this.currentUser = u;
        // Si es un usuario diferente, limpiar el carrito anterior antes de cargar el nuevo
        if (oldUserId !== u.id) {
          this.items = [];
          this.loadCart(); // Cargar el carrito del nuevo usuario
        }
      } else {
        // Si se cierra sesión, limpiar todo
        if (oldUserId && this.currentUser?.email) {
          const oldKey = `cart_user_${oldUserId}_${this.currentUser.email}`;
          localStorage.removeItem(oldKey); // Limpiar storage del usuario anterior
        }
        this.currentUser = null;
        this.items = [];
        this.updateCart();
      }
    });
  }

  

  private saveCart(): void {
    // Solo persistir si hay un usuario autenticado
    if (this.currentUser && this.currentUser.id != null && this.currentUser.id !== 0) {
      // Guardar en el backend
      this.http.post(`${this.apiUrl}/carrito`, {
        usuario_id: this.currentUser.id,
        items: this.items
      }).subscribe({
        error: (error) => console.error('Error al guardar el carrito:', error)
      });
    }
    // Actualizar observables siempre
    this.updateCart();
  }

  private updateCart(): void {
    this.cartSubject.next(this.items);
    const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totalSubject.next(total);
  }

  addToCart(product: Omit<CartItem, 'quantity'>): void {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    
    this.saveCart();
  }

  removeFromCart(productId: number): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
      }
    }
  }

  clearCart(): void {
    this.items = [];
    // Remove persisted cart for current user
    if (this.currentUser && this.currentUser.id != null) {
      try {
        const key = `cart_user_${this.currentUser.id}`;
        localStorage.removeItem(key);
      } catch (e) {}
    }
    this.updateCart();
  }

  getCartItems(): CartItem[] {
    return [...this.items];
  }

  getCartTotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Carga el carrito desde el storage del usuario actual
  private loadCart(): void {
    this.items = [];
    if (this.currentUser && this.currentUser.id != null && this.currentUser.id !== 0) {
      // Cargar desde el backend
      this.http.get(`${this.apiUrl}/carrito`, {
        params: { usuario_id: this.currentUser.id.toString() }
      }).subscribe({
        next: (response: any) => {
          if (response.items && response.items.length) {
            // Para cada item pedimos detalles del producto y los combinamos
            const calls = response.items.map((item: any) =>
              this.productosService.getProducto(item.producto_id).pipe(
                catchError(err => {
                  console.error('Error al obtener producto', item.producto_id, err);
                  return of(null);
                })
              )
            );

            // Ejecutar todas las llamadas en paralelo (cast para ajustar tipos de TS)
            (forkJoin(calls) as Observable<Array<Producto | null>>).subscribe((products) => {
              const baseUrl = this.productosService.apiUrl.replace(/\/api\/?$/,'');
              this.items = response.items.map((item: any, idx: number) => {
                const prod = products[idx];
                let imageUrl: string | undefined = undefined;
                if (prod && prod.imagen_url) {
                  const img = prod.imagen_url.trim();
                  if (/^https?:\/\//i.test(img)) {
                    // URL absoluta ya válida
                    imageUrl = img;
                  } else if (/^static\//i.test(img) || /^images\//i.test(img) || /\//.test(img)) {
                    // Ruta relativa que ya incluye carpeta, p. ej. 'static/images/...' o 'images/...'
                    imageUrl = `${baseUrl}/${img.replace(/^\//, '')}`;
                  } else {
                    // Solo nombre de archivo, asumir carpeta 'static/images'
                    imageUrl = `${baseUrl}/static/images/${img}`;
                  }
                }

                return {
                  id: item.producto_id,
                  quantity: item.cantidad,
                  name: prod ? prod.nombre : ('Producto ' + item.producto_id),
                  price: prod ? prod.precio : 0,
                  image: imageUrl,
                  description: prod ? prod.descripcion : undefined
                } as any;
              });
              this.updateCart();
            }, (err) => {
              console.error('Error en forkJoin productos:', err);
              this.items = response.items.map((item: any) => ({
                id: item.producto_id,
                quantity: item.cantidad,
                name: 'Producto ' + item.producto_id,
                price: 0
              }));
              this.updateCart();
            });
          } else {
            this.items = [];
            this.updateCart();
          }
        },
        error: (error) => {
          console.error('Error al cargar el carrito:', error);
          this.items = [];
          this.updateCart();
        }
      });
    } else {
      this.updateCart();
    }
  }

  // Limpiar suscripciones si el servicio es destruido (por limpieza, aunque es providedIn: 'root')
  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
      this.authSub = null;
    }
  }
}
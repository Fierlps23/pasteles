

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../services/productos.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class Productos implements OnInit {
  productos: Producto[] = [];
  productosAll: Producto[] = []; // copia maestra para filtrado en cliente
  categorias: string[] = ['Pasteles', 'Cupcakes', 'Galletas', 'Postres'];
  categoriaSeleccionada: string = '';
  terminoBusqueda: string = '';
  cargando: boolean = false;
  error: string = '';

  constructor(public productosService: ProductosService, private cartService: CartService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.error = '';
    this.productosService.getProductos().subscribe({
      next: (data) => { this.productos = data; this.productosAll = [...data]; this.cargando = false; },
      error: (e) => { this.error = 'Error al cargar los productos.'; this.cargando = false; console.error(e); }
    });
  }

  // Construye la URL completa de la imagen para cada producto
  getImageUrl(producto: Producto) {
    try {
      const base = this.productosService.apiUrl.replace(/\/api\/?$/, '');
  return producto.imagen_url ? `${base}/static/images/${producto.imagen_url}` : `${base}/static/images/placeholder.svg`;
    } catch (e) {
      return `/static/images/placeholder.png`;
    }
  }

  filtrarPorCategoria(categoria: string) {
    // Acepta 'all' como recargar todos los productos
    // Filtrado en cliente: evita llamar al endpoint /productos/categoria que puede no existir
    this.categoriaSeleccionada = categoria;
    if (!categoria || categoria === 'all') {
      // Restaurar lista completa
      this.productos = this.productosAll.length ? [...this.productosAll] : [];
      return;
    }

    // Normalizar término y filtrar por nombre/descripcion que contenga la palabra de categoría
    const term = categoria.toLowerCase();
    this.productos = (this.productosAll.length ? this.productosAll : this.productos).filter(p => {
      const name = (p.nombre || '').toLowerCase();
      const desc = (p.descripcion || '').toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }

  buscarProductos() {
    if (!this.terminoBusqueda.trim()) { this.cargarProductos(); return; }
    this.cargando = true;
    this.productosService.buscarProductos(this.terminoBusqueda).subscribe({
      next: (data) => { this.productos = data; this.cargando = false; },
      error: (e) => { this.error = 'Error en la búsqueda.'; this.cargando = false; console.error(e); }
    });
  }

  // Manejo de imágenes con fallback
  onImgError(event: any) {
    try {
      const base = this.productosService.apiUrl.replace(/\/api\/?$/, '');
      event.target.src = `${base}/static/images/placeholder.svg`;
    } catch (e) {
      event.target.src = '/static/images/placeholder.png';
    }
  }

  // Acción de cliente para agregar al carrito (frontend-only, no toca DB)
  addToCart(producto: Producto) {
    // Mapear Producto a CartItem y agregar al servicio de carrito local
    const item = {
      id: producto.id_producto,
      name: producto.nombre,
      price: producto.precio,
      image: this.getImageUrl(producto),
      description: producto.descripcion
    };
    this.cartService.addToCart(item);
    // Feedback al usuario
    alert(`${producto.nombre} ha sido agregado al carrito.`);
  }

  // Scroll suave a secciones en la página (usa id's de la plantilla)
  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
}

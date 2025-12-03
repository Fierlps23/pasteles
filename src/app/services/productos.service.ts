import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  // Exponemos apiUrl para que componentes puedan construir rutas completas a recursos estáticos
  public apiUrl = 'http://localhost:5000/api'; // URL de tu backend Flask

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  // Obtener productos por categoría
  getProductosPorCategoria(categoria: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/categoria/${categoria}`);
  }

  // Obtener un producto específico
  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  // Buscar productos
  buscarProductos(termino: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/buscar/${termino}`);
  }
}
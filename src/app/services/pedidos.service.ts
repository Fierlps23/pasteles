import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PedidoPayload {
  nombre: string;
  email: string;
  producto: string;
  cantidad?: number;
  fecha_entrega?: string; // ISO
  nota?: string;
}

export interface PedidoResponse extends PedidoPayload {
  id: number;
  creado_en: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  public apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  crearPedido(pedido: PedidoPayload): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/pedidos`, pedido);
  }
}

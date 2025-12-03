import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})
export class Usuarios implements OnInit {
  currentTab: string = 'dashboard';
  isAdmin: boolean = false;
  userEmail = '';
  user = {
    name: '',
    initials: '',
    vipSince: '',
    orders: 0,
    spent: 0,
    rating: 0,
    points: 0
  };

  recentOrders = [
    { title: 'Pastel de Chocolate', date: '15 Nov 2024', status: 'Entregado', price: 35 },
    { title: 'Cupcakes Gourmet', date: '8 Nov 2024', status: 'Entregado', price: 18 },
    { title: 'Pastel Personalizado', date: '2 Nov 2024', status: 'Entregado', price: 65 }
  ];

  favorites = [
    { name: 'Pastel de Chocolate Supremo', emoji: '🍫', price: 35 },
    { name: 'Cheesecake de Fresa', emoji: '🍓', price: 28 },
    { name: 'Cupcakes Gourmet', emoji: '🧁', price: 18 }
  ];

  addresses = [
    { label: 'Principal', title: 'Casa', street: 'Calle Dulce 456, Apartamento 3B', phone: '+52 55 1234-5678', zip: '12345' },
    { label: 'Oficina', title: 'Oficina', street: 'Av. Principal 789, Piso 15', phone: '+52 55 9876-5432', zip: '54321' }
  ];

  settings = {
    emailNotifications: true,
    reminders: true,
    sms: true
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userEmail = user.email;
        this.user.name = user.first_name || user.email;
        
        // Calcular iniciales
        if (this.user.name) {
          const parts = this.user.name.split(' ');
          this.user.initials = parts.map(p => p[0]).slice(0,2).join('').toUpperCase();
        }

        // Verificar si es administrador
        this.isAdmin = user.role === 'admin';
        
        // Configurar fecha VIP basada en la fecha actual
        const currentDate = new Date();
        this.user.vipSince = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        
        // Cargar datos del usuario
        this.loadUserData();
      } else {
        // Limpiar datos cuando se cierra sesión
        this.userEmail = '';
        this.user.name = '';
        this.user.initials = '';
        this.isAdmin = false;
        this.user.vipSince = '';
        this.user.orders = 0;
        this.user.spent = 0;
        this.user.rating = 0;
        this.user.points = 0;
      }
    });
  }

  private loadUserData() {
    if (this.isAdmin) {
      // Cargar datos administrativos si es necesario
      this.user.orders = 0; // Los administradores no tienen pedidos personales
      this.user.spent = 0;
      this.user.rating = 5.0;
      this.user.points = 0;
    } else {
      // Cargar datos de cliente
      this.user.orders = this.recentOrders.length;
      this.user.spent = this.recentOrders.reduce((total, order) => total + order.price, 0);
      this.user.rating = 4.8;
      this.user.points = Math.floor(this.user.spent * 0.1);
    }
  }

  showTab(tab: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.currentTab = tab;
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  saveProfile() {
    // TODO: Implementar llamada al backend para actualizar perfil
    console.log('Guardando perfil...', {
      name: this.user.name,
      email: this.userEmail
    });
  }

  saveSettings() {
    // TODO: Implementar llamada al backend para actualizar configuración
    console.log('Guardando configuración...', this.settings);
  }
}

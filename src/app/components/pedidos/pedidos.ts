import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.css'],
})
export class Pedidos implements OnInit {
  // Cliente / contacto
  nombre = '';
  email = '';

  // Personalización
  flavorPrice = 25;
  sizeMultiplier = 1;
  fillingPrice = 0;
  coveringPrice = 0;
  decorationPrice = 0;
  extrasPrice = 0;
  decorationSelected: string | null = null;
  selectedElements: string[] = [];

  // Detalles finales
  occasion = '';
  personalMessage = '';
  charCount = 0;
  fecha_entrega: string | null = null;
  nota = '';

  // UI state
  currentStep = 1;
  minDate = '';

  // Preview
  previewEmoji = '🎂';
  previewDecoration = '✨';
  previewDescription = 'Pastel Personalizado';

  // resumen
  customPrice = 25;

  enviando = false;
  mensaje = '';

  // opciones
  decorationOptions = [
    { label: 'Clásica', price: 0, emoji: '🎂' },
    { label: 'Infantil', price: 15, emoji: '🎪' },
    { label: 'Elegante', price: 25, emoji: '💎' },
    { label: 'Personalizada', price: 35, emoji: '🎨' }
  ];

  elementOptions = [
    { key: 'flores', label: '🌸 Flores Naturales', price: 20 },
    { key: 'perlas', label: '💎 Perlas Comestibles', price: 15 },
    { key: 'figuras', label: '🎭 Figuras Personalizadas', price: 25 },
    { key: 'luces', label: '✨ Luces LED', price: 18 }
  ];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.setMinDate();
    this.updateCustomPrice();
  }

  get stepTitle() {
    if (this.currentStep === 1) return 'Paso 1: Configuración Básica';
    if (this.currentStep === 2) return 'Paso 2: Decoración y Estilo';
    return 'Paso 3: Detalles Finales';
  }

  nextStep() {
    if (this.currentStep < 3) { this.currentStep++; }
  }

  prevStep() {
    if (this.currentStep > 1) { this.currentStep--; }
  }

  onElementChange(e: any, option: any) {
    const checked = e.target.checked;
    if (checked) {
      this.selectedElements.push(option.key);
    } else {
      this.selectedElements = this.selectedElements.filter(k => k !== option.key);
    }
    this.updateCustomPrice();
  }

  calculateExtras(): number {
    let total = 0;
    this.selectedElements.forEach(key => {
      const opt = this.elementOptions.find(o => o.key === key);
      if (opt) total += opt.price;
    });
    this.extrasPrice = total;
    return total;
  }

  updateCustomPrice() {
    const decoration = parseInt(String(this.decorationPrice || 0)) || 0;
    const baseTotal = (this.flavorPrice || 0) + (this.fillingPrice || 0) + (this.coveringPrice || 0) + decoration + this.calculateExtras();
    this.customPrice = Math.round(baseTotal * (this.sizeMultiplier || 1));
    this.updatePreview();
  }

  updatePreview() {
    // emoji from flavorPrice mapping (approximate)
    const mapping: any = {25:'🎂',30:'🍫',35:'🍓',40:'❤️',45:'🥛',38:'🥕',42:'🍋'};
    this.previewEmoji = mapping[this.flavorPrice] || '🎂';
    const deco = this.decorationOptions.find(d => d.price === Number(this.decorationPrice));
    this.previewDecoration = deco ? deco.emoji : '✨';
    this.previewDescription = `Pastel ${this.previewEmoji} - ${this.previewDecoration}`;
  }

  setMinDate() {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    this.minDate = today.toISOString().split('T')[0];
  }

  // Enviar pedido al backend usando el servicio (mantiene integridad del backend)
  onSubmit() {
    // Construir producto como descripción compacta
    const productoDesc = `Personalizado: ${this.previewDescription} - Mensaje: ${this.personalMessage || '-'} `;
    const payload: any = {
      nombre: this.nombre,
      email: this.email,
      producto: productoDesc,
      cantidad: 1,
      fecha_entrega: this.fecha_entrega || undefined,
      nota: this.nota || ''
    };

    if (!this.nombre || !this.email) {
      this.mensaje = 'Completa nombre y correo antes de agregar al carrito.';
      return;
    }

    this.enviando = true;
    this.pedidosService.crearPedido(payload).subscribe({
      next: (res) => {
        this.mensaje = 'Pedido agregado correctamente. ID: ' + (res.id || 'N/A');
        this.enviando = false;
        // reset básico
        this.nombre = '';
        this.email = '';
      },
      error: (err) => {
        console.error(err);
        this.mensaje = 'Error al enviar el pedido.';
        this.enviando = false;
      }
    });
  }
}

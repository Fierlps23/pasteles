import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Productos } from '../productos/productos';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Productos],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
// Componente Home con método para scroll suave desde la plantilla
export class Home {
  // Construye la URL del video usando la URL base del backend si está configurada.
  videoSrc: string = (environment.backendUrl ? environment.backendUrl : '') + '/assets/videos/fondo.mp4';
  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

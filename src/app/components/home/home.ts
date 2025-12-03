import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Productos } from '../productos/productos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Productos],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
// Componente Home con método para scroll suave desde la plantilla
export class Home {
  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

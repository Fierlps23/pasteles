import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginData = {
    email: '',
    password: ''
  };
  errorMessage = '';
  isLoading = false;
  private candyInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Iniciar animación de dulces cayendo
    this.startCandyAnimation();
  }

  ngOnDestroy() {
    // Limpiar intervalo al destruir componente
    if (this.candyInterval) {
      clearInterval(this.candyInterval);
    }
  }

 private readonly CANDIES = [''];

private startCandyAnimation() {
  const container = document.getElementById('candy-container');
  if (!container) return;

  this.candyInterval = setInterval(() => {
    const candyList = [''];
    const candy = document.createElement('div');

    candy.className = 'candy';
    candy.textContent = candyList[Math.floor(Math.random() * candyList.length)];

    // Posición horizontal aleatoria
    candy.style.left = Math.random() * 100 + '%';

    // Duración de la caída
    const duration = Math.random() * 3 + 3;
    candy.style.animationDuration = duration + 's';

    container.appendChild(candy);

    setTimeout(() => candy.remove(), duration * 1000);
  }, 500);
}


  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        }
      });
  }
}
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Productos } from './components/productos/productos';
import { Pedidos } from './components/pedidos/pedidos';
import { Usuarios } from './components/usuarios/usuarios';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { CartComponent } from './components/cart/cart';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'productos', component: Productos },
	{ path: 'pedidos', component: Pedidos, canActivate: [authGuard] },
	{ path: 'usuarios', component: Usuarios, canActivate: [authGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'forgot-password', component: ForgotPasswordComponent },
	{ path: 'reset-password', component: ResetPasswordComponent },
	{ path: 'cart', component: CartComponent },
	{ path: 'pago-exitoso', component: PagoExitosoComponent },
	{ path: 'pago-fallido', component: Home }, // Podemos crear un componente específico después
	{ path: 'pago-pendiente', component: Home }, // Podemos crear un componente específico después
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];

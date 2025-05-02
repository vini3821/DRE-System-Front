import { Routes } from '@angular/router';
// Importe apenas após criar o componente
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent }, // Adicione esta rota
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
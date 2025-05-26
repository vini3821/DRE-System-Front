import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, of } from 'rxjs';

// Interface para tipar a resposta do login
interface LoginResponse {
    token?: string;
    user?: any;
    success?: boolean;
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    error = '';
    loading = false;
    hidePassword = true;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient
    ) {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';
        
        this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, this.loginForm.value)
            .pipe(
                catchError(error => {
                    console.error('Erro de login:', error);
                    this.error = error.error?.message || 'Falha no login. Verifique suas credenciais.';
                    
                    // Fallback para login mockado se a API não estiver disponível
                    if (this.loginForm.value.username === 'admin' &&
                        this.loginForm.value.password === 'admin123') {
                        
                        // Configura token e usuário mockados
                        localStorage.setItem('token', 'mock-jwt-token');
                        localStorage.setItem('user', JSON.stringify({
                            name: 'Admin Demo',
                            role: 'administrator'
                        }));
                        
                        return of({ success: true } as LoginResponse);
                    }
                    
                    return of({ success: false } as LoginResponse);
                }),
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe(response => {
                // Agora response é tipado corretamente com a interface LoginResponse
                if (response && response.success !== false) {
                    // Se existir token na resposta original, salve-o
                    if (response.token) {
                        localStorage.setItem('token', response.token);
                    }
                    
                    // Se existir user na resposta original, salve-o
                    if (response.user) {
                        localStorage.setItem('user', JSON.stringify(response.user));
                    }
                    
                    this.router.navigate(['/dashboard']);
                }
            });
    }
}
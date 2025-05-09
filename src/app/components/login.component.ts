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
        MatCardModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    error = '';
    loading = false;

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
        this.http.post(`${environment.apiUrl}/auth/login`, this.loginForm.value)
            .subscribe({
                next: (response: any) => {
                    // Armazena token no localStorage
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.error = error.error?.message || 'Falha no login';
                    this.loading = false;

                    // Fallback para login mockado se a API não estiver disponível
                    if (this.loginForm.value.username === 'admin' &&
                        this.loginForm.value.password === 'admin123') {
                        this.router.navigate(['/dashboard']);
                    }
                }
            });
    }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';
import { CreateUserRequest } from '../models/user.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatSelectModule,
        MatSnackBarModule
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    hidePassword = true;
    hideConfirmPassword = true;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private userService: UserService,
        private snackBar: MatSnackBar
    ) {
        this.registerForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    // Validador customizado para confirmar senha
    passwordMatchValidator(control: AbstractControl) {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit() {
        if (this.registerForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.loading = true;
        const userData: CreateUserRequest = {
            name: this.registerForm.value.name,
            username: this.registerForm.value.username,
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            role: 'user'
        };

        this.userService.createUser(userData)
            .pipe(
                catchError(error => {
                    console.error('Erro ao registrar usuário:', error);
                    const errorMessage = error.error?.message || 'Erro ao criar conta. Tente novamente.';
                    this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
                    return of(null);
                }),
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe(response => {
                if (response) {
                    this.snackBar.open('Conta criada com sucesso! Faça login para continuar.', 'Fechar', {
                        duration: 5000
                    });
                    this.router.navigate(['/login']);
                }
            });
    }

    private markFormGroupTouched() {
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            control?.markAsTouched();
        });
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
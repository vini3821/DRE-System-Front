// src/app/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackBar: MatSnackBar) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMsg = '';

                if (error.error instanceof ErrorEvent) {
                    // Erro do cliente
                    errorMsg = `Erro: ${error.error.message}`;
                } else {
                    // Erro da API
                    errorMsg = `Erro ${error.status}: ${error.message}`;

                    // Tratamentos específicos por código
                    switch (error.status) {
                        case 0:
                            errorMsg = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
                            break;
                        case 404:
                            errorMsg = 'Recurso não encontrado no servidor.';
                            break;
                        case 500:
                            errorMsg = 'Erro interno do servidor.';
                            break;
                    }
                }

                this.snackBar.open(errorMsg, 'Fechar', {
                    duration: 5000
                });

                return throwError(() => error);
            })
        );
    }
}
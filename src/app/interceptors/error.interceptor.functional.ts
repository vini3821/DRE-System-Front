// src/app/interceptors/error.interceptor.functional.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../services/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  
  return next(req).pipe(
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
      
      if (environment.logLevel === 'debug') {
        console.group('Erro HTTP:');
        console.error('Status:', error.status);
        console.error('URL:', req.url);
        console.error('Mensagem:', error.message);
        console.error('Erro completo:', error);
        console.groupEnd();
      }
      
      snackBar.open(errorMsg, 'Fechar', {
        duration: 5000
      });
      
      return throwError(() => error);
    })
  );
};
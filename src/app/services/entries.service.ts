// services/entries.service.ts - Versão com fallback para dados mockados
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError, timeout } from 'rxjs';
import { Entry } from '../models/entry.model';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  private apiUrl = `${environment.apiUrl}/entries`;

  // Dados mockados para caso a API falhe
  private mockEntries: Entry[] = [
    {
      entryID: 9999,
      entryDate: new Date(),
      entryType: 'Receita',
      value: 1500,
      fkc: 1,
      collaborator: {
        name: 'Colaborador Demo',
        costCenter: {
          description: 'Centro de Custo Demo'
        }
      }
    }
  ];

  constructor(private http: HttpClient) { }

  getEntries(): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.apiUrl)
      .pipe(
        timeout(10000), // Timeout de 10 segundos
        catchError(error => {
          console.error('Erro ao buscar entradas:', error);
          console.log('Retornando dados mockados devido a erro na API');
          // Se estiver em desenvolvimento, retornar dados mockados
          if (!environment.production) {
            return of(this.mockEntries);
          }
          return throwError(() => error);
        })
      );
  }

  getEntry(id: number): Observable<Entry> {
    return this.http.get<Entry>(`${this.apiUrl}/${id}`)
      .pipe(
        timeout(10000),
        catchError(error => {
          console.error(`Erro ao buscar entrada ${id}:`, error);
          // Se estiver em modo de desenvolvimento e o ID for o mockado
          if (!environment.production && id === 9999) {
            return of(this.mockEntries[0]);
          }
          return throwError(() => error);
        })
      );
  }

  createEntry(entry: Entry): Observable<Entry> {
    return this.http.post<Entry>(this.apiUrl, entry)
      .pipe(
        timeout(10000),
        catchError(error => {
          console.error('Erro ao criar entrada:', error);
          // Se estiver em modo de desenvolvimento
          if (!environment.production) {
            const mockEntry = { ...entry, entryID: Math.floor(Math.random() * 10000) };
            this.mockEntries.push(mockEntry);
            return of(mockEntry);
          }
          return throwError(() => error);
        })
      );
  }

  updateEntry(id: number, entry: Entry): Observable<Entry> {
    return this.http.put<Entry>(`${this.apiUrl}/${id}`, entry)
      .pipe(
        timeout(10000),
        catchError(error => {
          console.error(`Erro ao atualizar entrada ${id}:`, error);
          // Se estiver em modo de desenvolvimento
          if (!environment.production) {
            const index = this.mockEntries.findIndex(e => e.entryID === id);
            if (index >= 0) {
              this.mockEntries[index] = { ...entry, entryID: id };
              return of(this.mockEntries[index]);
            }
          }
          return throwError(() => error);
        })
      );
  }

  deleteEntry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        timeout(10000),
        catchError(error => {
          console.error(`Erro ao excluir entrada ${id}:`, error);
          // Se estiver em modo de desenvolvimento
          if (!environment.production) {
            this.mockEntries = this.mockEntries.filter(e => e.entryID !== id);
            return of({ success: true });
          }
          return throwError(() => error);
        })
      );
  }
}
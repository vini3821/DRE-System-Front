import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Entry } from '../models/entry.model';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  private apiUrl = `${environment.apiUrl}/entries`;

  constructor(private http: HttpClient) { }

  getEntries(): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar entradas:', error);
          return throwError(() => error);
        })
      );
  }

  getEntry(id: number): Observable<Entry> {
    return this.http.get<Entry>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Erro ao buscar entrada ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  createEntry(entry: Entry): Observable<Entry> {
    return this.http.post<Entry>(this.apiUrl, entry)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar entrada:', error);
          return throwError(() => error);
        })
      );
  }

  updateEntry(id: number, entry: Entry): Observable<Entry> {
    return this.http.put<Entry>(`${this.apiUrl}/${id}`, entry)
      .pipe(
        catchError(error => {
          console.error(`Erro ao atualizar entrada ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  deleteEntry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Erro ao excluir entrada ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
}
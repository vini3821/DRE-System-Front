import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Entry } from '../models/entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  // URL base da sua API
  private apiUrl = 'http://localhost:5298/api/entries';
  
  // Para desenvolvimento, use dados mockados
  private mockEntries: Entry[] = [
    {
      entryID: 1,
      entryDate: new Date(),
      entryType: 'Receita',
      value: 1000,
      fkc: 1,
      collaborator: { 
        name: 'João Silva', 
        costCenter: { description: 'Financeiro' } 
      }
    },
    {
      entryID: 2,
      entryDate: new Date(),
      entryType: 'Despesa',
      value: 350,
      fkc: 2,
      collaborator: { 
        name: 'Maria Santos', 
        costCenter: { description: 'Marketing' } 
      }
    }
  ];

  constructor(private http: HttpClient) { }

  getEntries(): Observable<Entry[]> {
    // Para desenvolvimento, retorne dados mockados
    return of(this.mockEntries);
    
    // Quando conectar à API real:
    // return this.http.get<Entry[]>(this.apiUrl);
  }

  getEntry(id: number): Observable<Entry> {
    // Para desenvolvimento, retorne dados mockados
    const entry = this.mockEntries.find(e => e.entryID === id);
    return of(entry as Entry);
    
    // Quando conectar à API real:
    // return this.http.get<Entry>(`${this.apiUrl}/${id}`);
  }

  createEntry(entry: Entry): Observable<Entry> {
    // Para desenvolvimento, simule a criação
    return of({...entry, entryID: Math.floor(Math.random() * 1000)});
    
    // Quando conectar à API real:
    // return this.http.post<Entry>(this.apiUrl, entry);
  }

  updateEntry(id: number, entry: Entry): Observable<Entry> {
    // Para desenvolvimento, simule a atualização
    return of({...entry, entryID: id});
    
    // Quando conectar à API real:
    // return this.http.put<Entry>(`${this.apiUrl}/${id}`, entry);
  }
}
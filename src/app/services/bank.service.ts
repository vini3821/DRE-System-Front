import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bank } from '../models/bank.model';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private apiUrl = `${environment.apiUrl}/banks`;

  constructor(private http: HttpClient) { }

  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(this.apiUrl);
  }

  getBank(id: number): Observable<Bank> {
    return this.http.get<Bank>(`${this.apiUrl}/${id}`);
  }

  createBank(bank: Bank): Observable<Bank> {
    return this.http.post<Bank>(this.apiUrl, bank);
  }

  updateBank(id: number, bank: Bank): Observable<Bank> {
    return this.http.put<Bank>(`${this.apiUrl}/${id}`, bank);
  }

  deleteBank(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
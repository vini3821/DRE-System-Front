import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Bank } from '../models/bank.model';


@Injectable({
    providedIn: 'root'
})
export class BankService {
    // Para desenvolvimento, use dados mockados
    private mockBanks: Bank[] = [
        {
            bankID: 1,
            code: '001',
            name: 'Banco do Brasil'
        },
        {
            bankID: 2,
            code: '341',
            name: 'Itaú'
        }
    ];

    constructor(private http: HttpClient) { }

    getBanks(): Observable<Bank[]> {
        // Para desenvolvimento, retorne dados mockados
        return of(this.mockBanks);

        // Quando conectar à API real:
        // return this.http.get<Bank[]>(`${environment.apiUrl}/banks`);
    }
}
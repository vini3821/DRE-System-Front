import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

// Interface para setor
export interface Sector {
    sectorID: number;
    name: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SectorService {
    private apiUrl = `${environment.apiUrl}/sectors`;

    constructor(private http: HttpClient) { }

    getSectors(): Observable<Sector[]> {
        return this.http.get<Sector[]>(this.apiUrl);
    }

    getSector(id: number): Observable<Sector> {
        return this.http.get<Sector>(`${this.apiUrl}/${id}`);
    }

    createSector(sector: Sector): Observable<Sector> {
        return this.http.post<Sector>(this.apiUrl, sector);
    }

    updateSector(id: number, sector: Sector): Observable<Sector> {
        return this.http.put<Sector>(`${this.apiUrl}/${id}`, sector);
    }

    deleteSector(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
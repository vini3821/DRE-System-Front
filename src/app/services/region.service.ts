import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

// Interface para região
export interface Region {
    regionID: number;
    name: string;
    code?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RegionService {
    private apiUrl = `${environment.apiUrl}/regions`;

    constructor(private http: HttpClient) { }

    getRegions(): Observable<Region[]> {
        return this.http.get<Region[]>(this.apiUrl);
    }

    getRegion(id: number): Observable<Region> {
        return this.http.get<Region>(`${this.apiUrl}/${id}`);
    }

    createRegion(region: Partial<Region>): Observable<Region> {
        return this.http.post<Region>(this.apiUrl, region);
    }

    updateRegion(id: number, region: Region): Observable<Region> {
        return this.http.put<Region>(`${this.apiUrl}/${id}`, region);
    }

    deleteRegion(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
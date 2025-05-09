import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

// Interface para centro de custo
export interface CostCenter {
    costCenterID: number;
    description: string;
    code?: string;
    fkRegion?: number;
    fkSector?: number;
    region?: any;
    sector?: any;
}

@Injectable({
    providedIn: 'root'
})
export class CostCenterService {
    private apiUrl = `${environment.apiUrl}/costcenters`;

    constructor(private http: HttpClient) { }

    getCostCenters(): Observable<CostCenter[]> {
        return this.http.get<CostCenter[]>(this.apiUrl);
    }

    getCostCenter(id: number): Observable<CostCenter> {
        return this.http.get<CostCenter>(`${this.apiUrl}/${id}`);
    }

    createCostCenter(costCenter: CostCenter): Observable<CostCenter> {
        return this.http.post<CostCenter>(this.apiUrl, costCenter);
    }

    updateCostCenter(id: number, costCenter: CostCenter): Observable<CostCenter> {
        return this.http.put<CostCenter>(`${this.apiUrl}/${id}`, costCenter);
    }

    deleteCostCenter(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // Método adicional para relatórios por região
    getReportByRegion(regionId: number, startDate?: Date, endDate?: Date): Observable<any> {
        let url = `${this.apiUrl}/report/byregion/${regionId}`;

        // Adiciona parâmetros de data se fornecidos
        if (startDate || endDate) {
            url += '?';
            if (startDate) {
                url += `startDate=${startDate.toISOString()}`;
            }
            if (endDate) {
                url += startDate ? `&endDate=${endDate.toISOString()}` : `endDate=${endDate.toISOString()}`;
            }
        }

        return this.http.get<any>(url);
    }
}
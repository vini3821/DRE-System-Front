// src/app/services/cost-center.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from './environment';

// Interface para o formato esperado pelo frontend
export interface CostCenter {
    costCenterID: number;
    description: string;
    code?: string;
    fkRegion?: number;
    fkSector?: number;
    region?: any;
    sector?: any;
}

// Interface para o formato real da API
interface ApiCostCenter {
    ccid: number;
    code: string;
    description: string;
    region?: {
        regionID: number;
        name: string;
    };
    sector?: {
        sectorID: number;
        name: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class CostCenterService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getCostCenters(): Observable<CostCenter[]> {
        return this.http.get<ApiCostCenter[]>(`${this.apiUrl}/costcenters`).pipe(
            map(data => {
                console.log('Dados brutos da API de centros de custo:', data);

                // Mapeia o formato da API para o formato esperado pelo frontend
                return data.map(item => ({
                    costCenterID: item.ccid, // Importante: mapeia ccid para costCenterID
                    description: item.description,
                    code: item.code,
                    fkRegion: item.region?.regionID,
                    fkSector: item.sector?.sectorID,
                    region: item.region,
                    sector: item.sector
                }));
            })
        );
    }

    getCostCenter(id: number): Observable<CostCenter> {
        return this.http.get<ApiCostCenter>(`${this.apiUrl}/costcenters/${id}`).pipe(
            map(item => ({
                costCenterID: item.ccid,
                description: item.description,
                code: item.code,
                fkRegion: item.region?.regionID,
                fkSector: item.sector?.sectorID,
                region: item.region,
                sector: item.sector
            }))
        );
    }

    // Atualize os métodos no CostCenterService
    createCostCenter(costCenter: CostCenter): Observable<CostCenter> {
        // Formato simplificado - enviar apenas os IDs, não objetos completos
        const apiPayload = {
            code: costCenter.code,
            description: costCenter.description,
            fkRegion: costCenter.fkRegion,   // Apenas o ID da região
            fkSector: costCenter.fkSector    // Apenas o ID do setor
        };

        console.log('Enviando para criação:', apiPayload);

        return this.http.post<ApiCostCenter>(`${this.apiUrl}/costcenters`, apiPayload).pipe(
            tap(response => console.log('Resposta da criação:', response)),
            map(item => ({
                costCenterID: item.ccid,
                description: item.description,
                code: item.code,
                fkRegion: item.region?.regionID,
                fkSector: item.sector?.sectorID,
                region: item.region,
                sector: item.sector
            }))
        );
    }

    updateCostCenter(id: number, costCenter: CostCenter): Observable<CostCenter> {
        // Formato simplificado - enviar apenas os IDs, não objetos completos
        const apiPayload = {
            code: costCenter.code,
            description: costCenter.description,
            fkRegion: costCenter.fkRegion,   // Apenas o ID da região
            fkSector: costCenter.fkSector    // Apenas o ID do setor
        };

        console.log('Enviando para atualização:', apiPayload);

        return this.http.put<ApiCostCenter>(`${this.apiUrl}/costcenters/${id}`, apiPayload).pipe(
            tap(response => console.log('Resposta da atualização:', response)),
            map(item => ({
                costCenterID: item.ccid,
                description: item.description,
                code: item.code,
                fkRegion: item.region?.regionID,
                fkSector: item.sector?.sectorID,
                region: item.region,
                sector: item.sector
            }))
        );
    }
    // Método para API Raw (direto para a API sem mapeamento de retorno)
    createCostCenterRaw(apiCostCenter: any): Observable<any> {
        console.log('Enviando para API (criar):', apiCostCenter);
        return this.http.post<any>(`${this.apiUrl}/costcenters`, apiCostCenter).pipe(
            tap(response => console.log('Resposta da API (criar):', response))
        );
    }

    // Método para API Raw (direto para a API sem mapeamento de retorno)
    updateCostCenterRaw(id: number, apiCostCenter: any): Observable<any> {
        console.log('Enviando para API (atualizar):', apiCostCenter);
        return this.http.put<any>(`${this.apiUrl}/costcenters/${id}`, apiCostCenter).pipe(
            tap(response => console.log('Resposta da API (atualizar):', response))
        );
    }

    deleteCostCenter(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/costcenters/${id}`);
    }
}
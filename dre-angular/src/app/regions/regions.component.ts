import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

// Modelo básico para Região
interface Region {
    regionID: number;
    name: string;
    code: string;
}

// Serviço temporário simulado
class RegionService {
    getRegions() {
        return {
            subscribe: (callbacks: any) => {
                // Dados simulados
                const regions = [
                    { regionID: 1, name: 'Norte', code: 'N' },
                    { regionID: 2, name: 'Nordeste', code: 'NE' },
                    { regionID: 3, name: 'Centro-Oeste', code: 'CO' },
                    { regionID: 4, name: 'Sudeste', code: 'SE' },
                    { regionID: 5, name: 'Sul', code: 'S' }
                ];

                // Simula um atraso de rede
                setTimeout(() => {
                    callbacks.next(regions);
                }, 500);
            }
        };
    }
}

@Component({
    selector: 'app-regions',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        RouterModule
    ],
    templateUrl: './regions.component.html',
    styleUrls: ['./regions.component.scss'],
    providers: [RegionService]
})
export class RegionsComponent implements OnInit {
    regions: Region[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'code', 'actions'];

    constructor(private regionService: RegionService) { }

    ngOnInit() {
        this.loading = true;
        this.regionService.getRegions().subscribe({
            next: (data: any) => {
                this.regions = data;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading regions', error);
                this.loading = false;
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir esta região?')) {
            // Implementação simulada de exclusão
            this.regions = this.regions.filter(r => r.regionID !== id);
        }
    }
}
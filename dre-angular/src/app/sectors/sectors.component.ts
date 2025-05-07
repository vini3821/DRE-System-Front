import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

// Modelo básico para Setor
interface Sector {
    sectorID: number;
    name: string;
    description: string;
}

// Serviço temporário simulado
class SectorService {
    getSectors() {
        return {
            subscribe: (callbacks: any) => {
                // Dados simulados
                const sectors = [
                    { sectorID: 1, name: 'Comércio', description: 'Setor de comércio' },
                    { sectorID: 2, name: 'Indústria', description: 'Setor industrial' },
                    { sectorID: 3, name: 'Serviços', description: 'Setor de serviços' },
                    { sectorID: 4, name: 'Tecnologia', description: 'Setor de tecnologia' }
                ];

                // Simula um atraso de rede
                setTimeout(() => {
                    callbacks.next(sectors);
                }, 500);
            }
        };
    }
}

@Component({
    selector: 'app-sectors',
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
    templateUrl: './sectors.component.html',
    styleUrls: ['./sectors.component.scss'],
    providers: [SectorService]
})
export class SectorsComponent implements OnInit {
    sectors: Sector[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'description', 'actions'];

    constructor(private sectorService: SectorService) { }

    ngOnInit() {
        this.loading = true;
        this.sectorService.getSectors().subscribe({
            next: (data: any) => {
                this.sectors = data;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading sectors', error);
                this.loading = false;
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este setor?')) {
            // Implementação simulada de exclusão
            this.sectors = this.sectors.filter(s => s.sectorID !== id);
        }
    }
}
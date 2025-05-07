import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

// Modelo básico para Centro de Custo
interface CostCenter {
    costCenterID: number;
    description: string;
}

// Serviço temporário simulado
class CostCenterService {
    getCostCenters() {
        return {
            subscribe: (callbacks: any) => {
                // Dados simulados
                const costCenters = [
                    { costCenterID: 1, description: 'Financeiro' },
                    { costCenterID: 2, description: 'Marketing' },
                    { costCenterID: 3, description: 'TI' },
                    { costCenterID: 4, description: 'Recursos Humanos' }
                ];

                // Simula um atraso de rede
                setTimeout(() => {
                    callbacks.next(costCenters);
                }, 500);
            }
        };
    }
}

@Component({
    selector: 'app-cost-centers',
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
    templateUrl: './cost-centers.component.html',
    styleUrls: ['./cost-centers.component.scss'],
    providers: [CostCenterService]
})
export class CostCentersComponent implements OnInit {
    costCenters: CostCenter[] = [];
    loading = false;
    displayedColumns: string[] = ['description', 'actions'];

    constructor(private costCenterService: CostCenterService) { }

    ngOnInit() {
        this.loading = true;
        this.costCenterService.getCostCenters().subscribe({
            next: (data: any) => {
                this.costCenters = data;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading cost centers', error);
                this.loading = false;
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
            // Implementação simulada de exclusão
            this.costCenters = this.costCenters.filter(c => c.costCenterID !== id);
        }
    }
}
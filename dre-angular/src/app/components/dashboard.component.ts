import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../services/entries.service';
import { Entry } from '../models/entry.model';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatMenuModule,
        MatProgressBarModule,
        MatTableModule,
        MatSnackBarModule,
        MatDialogModule,
        RouterModule,
        BaseChartDirective,
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    @ViewChild('sidenav') sidenav?: MatSidenav;

    entries: Entry[] = [];
    totalRevenue = 0;
    totalExpense = 0;
    netResult = 0;
    loading = false;
    displayedColumns: string[] = ['date', 'type', 'value', 'collaborator', 'costCenter', 'actions'];
    isMobile = false;
    isBrowser: boolean = false;

    // Configuração para o gráfico
    public doughnutChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        }
    };

    public doughnutChartData: ChartData<'doughnut'> = {
        labels: ['Receitas', 'Despesas'],
        datasets: [
            {
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#F44336']
            }
        ]
    };

    public doughnutChartType: ChartType = 'doughnut';

    constructor(
        private entriesService: EntriesService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        // Verificar se é dispositivo móvel apenas no navegador
        if (this.isBrowser) {
            this.checkScreenSize();
            window.addEventListener('resize', () => this.checkScreenSize());
        }
    }

    ngOnInit() {
        // Simulamos o carregamento
        this.loading = true;
        setTimeout(() => {
            this.loadMockData();
            this.loading = false;
        }, 1000);
    }

    checkScreenSize() {
        if (isPlatformBrowser(this.platformId)) {
            this.isMobile = window.innerWidth < 768;
            if (this.isMobile && this.sidenav) {
                this.sidenav.close();
            } else if (this.sidenav) {
                this.sidenav.open();
            }
        }
    }

    loadMockData() {
        // Dados simulados para teste
        this.entries = [
            {
                entryID: 1,
                entryDate: new Date('2025-05-02'),
                entryType: 'Despesa',
                value: 4045.00,
                fkc: 2,
                collaborator: {
                    name: 'Maria Santos',
                    costCenter: { description: 'Marketing' }
                }
            },
            {
                entryID: 2,
                entryDate: new Date('2025-05-02'),
                entryType: 'Despesa',
                value: 1007.00,
                fkc: 3,
                collaborator: {
                    name: 'Carlos Oliveira',
                    costCenter: { description: 'TI' }
                }
            },
            {
                entryID: 3,
                entryDate: new Date('2025-04-14'),
                entryType: 'Despesa',
                value: 800.00,
                fkc: 3,
                collaborator: {
                    name: 'Carlos Oliveira',
                    costCenter: { description: 'TI' }
                }
            },
            {
                entryID: 4,
                entryDate: new Date('2025-04-19'),
                entryType: 'Despesa',
                value: 1500.00,
                fkc: 2,
                collaborator: {
                    name: 'Maria Santos',
                    costCenter: { description: 'Marketing' }
                }
            }
        ];

        this.calculateTotals();
    }

    ngAfterViewInit() {
        // Inicializa o Chart.js apenas no navegador
        if (isPlatformBrowser(this.platformId)) {
            import('chart.js').then(Chart => {
                Chart.Chart.register(...Chart.registerables);
            });
        }
    }

    calculateTotals() {
        this.totalRevenue = this.entries
            .filter(e => e.entryType === 'Receita')
            .reduce((sum, entry) => sum + entry.value, 0);

        this.totalExpense = this.entries
            .filter(e => e.entryType === 'Despesa')
            .reduce((sum, entry) => sum + entry.value, 0);

        this.netResult = this.totalRevenue - this.totalExpense;

        // Atualizar os dados do gráfico
        this.doughnutChartData.datasets[0].data = [this.totalRevenue, this.totalExpense];
    }

    // Método para adicionar uma nova entrada mock (para testes)
    addMockEntry() {
        const types = ['Receita', 'Despesa'];
        const collaborators = [
            { id: 1, name: 'João Silva', center: 'Financeiro' },
            { id: 2, name: 'Maria Santos', center: 'Marketing' },
            { id: 3, name: 'Carlos Oliveira', center: 'TI' }
        ];

        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomCollaborator = collaborators[Math.floor(Math.random() * collaborators.length)];
        const randomValue = Math.floor(Math.random() * 5000) + 500;

        const newEntry: Entry = {
            entryID: this.entries.length + 1,
            entryDate: new Date(),
            entryType: randomType,
            value: randomValue,
            fkc: randomCollaborator.id,
            collaborator: {
                name: randomCollaborator.name,
                costCenter: { description: randomCollaborator.center }
            }
        };

        this.entries.unshift(newEntry);
        this.calculateTotals();

        this.snackBar.open(
            `${randomType} de R$ ${randomValue.toFixed(2)} adicionada com sucesso!`,
            'Fechar',
            { duration: 3000 }
        );
    }

    // Método para remover uma entrada
    removeEntry(entryId: number) {
        const entryToRemove = this.entries.find(e => e.entryID === entryId);
        if (entryToRemove) {
            this.entries = this.entries.filter(e => e.entryID !== entryId);
            this.calculateTotals();

            this.snackBar.open(
                `${entryToRemove.entryType} de R$ ${entryToRemove.value.toFixed(2)} removida com sucesso!`,
                'Fechar',
                { duration: 3000 }
            );
        }
    }

    // Método para confirmar antes de deletar
    confirmDelete(entryId: number) {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            this.removeEntry(entryId);
        }
    }
}
// src/app/components/dashboard.component.ts
import { Component, OnInit, ViewChild, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
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
export class DashboardComponent implements OnInit, AfterViewInit {
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
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit() {
        this.loading = true;
        this.loadEntries();
    }

    ngAfterViewInit() {
        // Inicializa o Chart.js apenas no navegador
        if (this.isBrowser) {
            import('chart.js').then(Chart => {
                Chart.Chart.register(...Chart.registerables);
            });
            
            // Agora é seguro configurar o sidenav, pois já foi inicializado
            setTimeout(() => {
                this.checkScreenSize();
                window.addEventListener('resize', () => this.checkScreenSize());
            });
        }
    }

    checkScreenSize() {
        if (isPlatformBrowser(this.platformId)) {
            this.isMobile = window.innerWidth < 768;
            if (this.sidenav) {
                if (this.isMobile) {
                    this.sidenav.close();
                } else {
                    this.sidenav.open();
                }
            }
        }
    }

    loadEntries() {
        if (this.isBrowser) {
            console.log('Iniciando carregamento de entradas...');
        }
        
        this.entriesService.getEntries().subscribe({
            next: (data) => {
                this.entries = data;
                this.calculateTotals();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar lançamentos', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
                this.entries = [];
                this.calculateTotals();
            }
        });
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

    // Método para confirmar antes de deletar
    confirmDelete(entryId: number) {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            this.deleteEntry(entryId);
        }
    }

    deleteEntry(entryId: number) {
        this.entriesService.deleteEntry(entryId).subscribe({
            next: () => {
                this.entries = this.entries.filter(e => e.entryID !== entryId);
                this.calculateTotals();
                this.snackBar.open('Lançamento excluído com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir lançamento com ID ${entryId}`, error);
                this.snackBar.open('Erro ao excluir lançamento', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
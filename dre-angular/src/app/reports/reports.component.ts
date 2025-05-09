// src/app/reports/reports.component.ts
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ReportService } from '../services/report.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        RouterModule,
        BaseChartDirective
    ],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    isBrowser: boolean = false;
    filterForm: FormGroup;

    // Gráfico de Barras - Receitas x Despesas
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    };

    public barChartType: ChartType = 'bar';
    public barChartData: ChartData<'bar'> = {
        labels: [],
        datasets: []
    };

    // Gráfico de Pizza - Distribuição por Centro de Custo
    public pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right'
            }
        }
    };

    public pieChartType: ChartType = 'pie';
    public pieChartData: ChartData<'pie'> = {
        labels: [],
        datasets: []
    };

    constructor(
        private reportService: ReportService,
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        this.filterForm = this.formBuilder.group({
            dateStart: [new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)],
            dateEnd: [new Date()],
            reportType: ['monthly']
        });
    }

    ngOnInit() {
        this.loadRevenueExpenseData();
        this.loadCostCenterData();
    }

    ngAfterViewInit() {
        // Inicializa o Chart.js apenas no navegador
        if (this.isBrowser) {
            import('chart.js').then(Chart => {
                Chart.Chart.register(...Chart.registerables);
            });
        }
    }

    loadRevenueExpenseData() {
        const startDate = this.filterForm.value.dateStart;
        const endDate = this.filterForm.value.dateEnd;
        
        this.reportService.getRevenueExpenseData(startDate, endDate).subscribe({
            next: (data: any) => {
                this.barChartData = data;
            },
            error: (error: any) => {
                console.error('Erro ao carregar dados de receita/despesa', error);
                this.snackBar.open('Erro ao carregar dados do relatório', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }

    loadCostCenterData() {
        const startDate = this.filterForm.value.dateStart;
        const endDate = this.filterForm.value.dateEnd;
        
        this.reportService.getCostCenterData(startDate, endDate).subscribe({
            next: (data: any) => {
                this.pieChartData = data;
            },
            error: (error: any) => {
                console.error('Erro ao carregar dados de centro de custo', error);
                this.snackBar.open('Erro ao carregar dados do relatório', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }

    applyFilter() {
        console.log('Aplicando filtros:', this.filterForm.value);
        this.loadRevenueExpenseData();
        this.loadCostCenterData();
    }

    exportPDF() {
        const startDate = this.filterForm.value.dateStart;
        const endDate = this.filterForm.value.dateEnd;
        const reportType = this.filterForm.value.reportType;
        
        this.reportService.exportPDF(reportType, startDate, endDate).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                
                this.snackBar.open('Relatório PDF exportado com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error('Erro ao exportar PDF', error);
                this.snackBar.open('Erro ao exportar relatório', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }

    exportExcel() {
        const startDate = this.filterForm.value.dateStart;
        const endDate = this.filterForm.value.dateEnd;
        const reportType = this.filterForm.value.reportType;
        
        this.reportService.exportExcel(reportType, startDate, endDate).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                
                this.snackBar.open('Relatório Excel exportado com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error('Erro ao exportar Excel', error);
                this.snackBar.open('Erro ao exportar relatório', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
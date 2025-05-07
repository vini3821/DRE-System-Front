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
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

// Dados simulados para os relatórios
class ReportService {
    getRevenueExpenseData() {
        return {
            subscribe: (callbacks: any) => {
                const data = {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                        {
                            label: 'Receitas',
                            data: [12000, 15000, 18000, 14000, 20000, 22000],
                            backgroundColor: '#66bb6a'
                        },
                        {
                            label: 'Despesas',
                            data: [10000, 12000, 14000, 15000, 16000, 18000],
                            backgroundColor: '#ef5350'
                        }
                    ]
                };

                setTimeout(() => {
                    callbacks.next(data);
                }, 500);
            }
        };
    }

    getCostCenterData() {
        return {
            subscribe: (callbacks: any) => {
                const data = {
                    labels: ['Criação', 'Financeiro', 'TI', 'RH', 'Vendas', 'Tráfego Pago', 'Assessoria', 'Televendas'],
                    datasets: [
                        {
                            data: [25, 20, 30, 15, 10],
                            backgroundColor: ['#ef5350', '#66bb6a', '#5b6bbf', '#4db6ac', '#ffa726']
                        }
                    ]
                };

                setTimeout(() => {
                    callbacks.next(data);
                }, 500);
            }
        };
    }
}

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
        ReactiveFormsModule,
        RouterModule,
        BaseChartDirective
    ],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss'],
    providers: [ReportService]
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
        this.reportService.getRevenueExpenseData().subscribe({
            next: (data: any) => {
                this.barChartData = data;
            },
            error: (error: any) => {
                console.error('Error loading revenue/expense data', error);
            }
        });
    }

    loadCostCenterData() {
        this.reportService.getCostCenterData().subscribe({
            next: (data: any) => {
                this.pieChartData = data;
            },
            error: (error: any) => {
                console.error('Error loading cost center data', error);
            }
        });
    }

    applyFilter() {
        // Na implementação real, aqui você chamaria o serviço com os parâmetros do filtro
        console.log('Aplicando filtros:', this.filterForm.value);
        // Recarregar os dados com base nos filtros
        this.loadRevenueExpenseData();
        this.loadCostCenterData();
    }

    exportPDF() {
        alert('Exportando relatório como PDF...');
        // Implementar a exportação real aqui
    }

    exportExcel() {
        alert('Exportando relatório como Excel...');
        // Implementar a exportação real aqui
    }
}
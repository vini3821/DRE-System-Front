// src/app/services/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  // Dados mockados para uso durante o desenvolvimento
  private mockRevenueExpenseData = {
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

  private mockCostCenterData = {
    labels: ['Criação', 'Financeiro', 'TI', 'RH', 'Vendas', 'Tráfego Pago', 'Assessoria'],
    datasets: [
      {
        data: [25, 20, 30, 15, 10, 18, 12],
        backgroundColor: ['#ef5350', '#66bb6a', '#5b6bbf', '#4db6ac', '#ffa726', '#9575cd', '#ff7043']
      }
    ]
  };

  constructor(private http: HttpClient) { }

  getRevenueExpenseData(startDate?: Date, endDate?: Date): Observable<any> {
    let url = `${this.apiUrl}/revenue-expense`;
    
    if (startDate || endDate) {
      url += '?';
      if (startDate) {
        url += `startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += startDate ? `&endDate=${endDate.toISOString()}` : `endDate=${endDate.toISOString()}`;
      }
    }
    
    // Usando dados mockados até que a API esteja pronta
    return of(this.mockRevenueExpenseData);
    
    // Quando a API estiver pronta, use:
    // return this.http.get<any>(url);
  }

  getCostCenterData(startDate?: Date, endDate?: Date): Observable<any> {
    let url = `${this.apiUrl}/cost-center`;
    
    if (startDate || endDate) {
      url += '?';
      if (startDate) {
        url += `startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += startDate ? `&endDate=${endDate.toISOString()}` : `endDate=${endDate.toISOString()}`;
      }
    }
    
    // Usando dados mockados até que a API esteja pronta
    return of(this.mockCostCenterData);
    
    // Quando a API estiver pronta, use:
    // return this.http.get<any>(url);
  }

  exportPDF(reportType: string, startDate?: Date, endDate?: Date): Observable<Blob> {
    let url = `${this.apiUrl}/export/pdf/${reportType}`;
    
    if (startDate || endDate) {
      url += '?';
      if (startDate) {
        url += `startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += startDate ? `&endDate=${endDate.toISOString()}` : `endDate=${endDate.toISOString()}`;
      }
    }
    
    // Simulação de download PDF
    const mockPdf = new Blob(['Conteúdo simulado de PDF'], { type: 'application/pdf' });
    return of(mockPdf);
    
    // Quando a API estiver pronta, use:
    // return this.http.get(url, { responseType: 'blob' });
  }

  exportExcel(reportType: string, startDate?: Date, endDate?: Date): Observable<Blob> {
    let url = `${this.apiUrl}/export/excel/${reportType}`;
    
    if (startDate || endDate) {
      url += '?';
      if (startDate) {
        url += `startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += startDate ? `&endDate=${endDate.toISOString()}` : `endDate=${endDate.toISOString()}`;
      }
    }
    
    // Simulação de download Excel
    const mockExcel = new Blob(['Conteúdo simulado de Excel'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return of(mockExcel);
    
    // Quando a API estiver pronta, use:
    // return this.http.get(url, { responseType: 'blob' });
  }
}
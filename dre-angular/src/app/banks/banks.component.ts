// src/app/banks/banks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank.model';

@Component({
    selector: 'app-banks',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSnackBarModule,
        RouterModule
    ],
    templateUrl: './banks.component.html',
    styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {
    banks: Bank[] = [];
    loading = false;
    displayedColumns: string[] = ['code', 'name', 'actions'];

    constructor(
        private bankService: BankService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loading = true;
        this.loadBanks();
    }

    loadBanks() {
        this.bankService.getBanks().subscribe({
            next: (data) => {
                this.banks = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar bancos', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este banco?')) {
            this.deleteBank(id);
        }
    }

    deleteBank(id: number) {
        this.bankService.deleteBank(id).subscribe({
            next: () => {
                this.banks = this.banks.filter(b => b.bankID !== id);
                this.snackBar.open('Banco excluído com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir banco com ID ${id}`, error);
                this.snackBar.open('Erro ao excluir banco', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
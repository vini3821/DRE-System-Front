import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
        RouterModule
    ],
    templateUrl: './banks.component.html',
    styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {
    banks: Bank[] = [];
    loading = false;
    displayedColumns: string[] = ['code', 'name', 'actions'];

    constructor(private bankService: BankService) { }

    ngOnInit() {
        this.loading = true;
        this.bankService.getBanks().subscribe({
            next: (data) => {
                this.banks = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading banks', error);
                this.loading = false;
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este banco?')) {
            // Implementação simulada de exclusão
            this.banks = this.banks.filter(b => b.bankID !== id);
        }
    }
}
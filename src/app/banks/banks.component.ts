import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank.model';
import { BankModalComponent } from './bank-modal/bank-modal.component';
import { Router } from '@angular/router';



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
        MatDialogModule,
        MatTooltipModule,
        MatRippleModule,
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
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) { }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

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

    openBankModal(bank?: Bank) {
        console.log('Abrindo modal de banco', bank);

        const dialogRef = this.dialog.open(BankModalComponent, {
            width: '600px',
            disableClose: false,
            data: { bank },
            autoFocus: true,
            panelClass: ['animated', 'fadeIn', 'custom-dialog-container'],
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal fechado com resultado:', result);
            if (result) {
                this.loadBanks();
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
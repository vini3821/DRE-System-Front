import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BankService } from '../../services/bank.service';
import { Bank } from '../../models/bank.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-bank-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './bank-modal.component.html',
    styleUrls: ['./bank-modal.component.scss']
})
export class BankModalComponent implements OnInit {
    form: FormGroup;
    isEdit = false;
    loading = false;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<BankModalComponent>,
        private bankService: BankService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: { bank?: Bank }
    ) {
        this.form = this.fb.group({
            code: ['', Validators.required],
            name: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        console.log('Modal de banco inicializado');

        // Verifica o modo de edição
        this.isEdit = !!(this.data && this.data.bank);
        console.log('Modo de edição:', this.isEdit);

        if (this.isEdit && this.data.bank) {
            this.loadBank(this.data.bank.bankID);
        } else {
            this.loading = false;
        }
    }

    loadBank(id: number): void {
        console.log('Carregando banco:', id);
        this.loading = true;

        this.bankService.getBank(id)
            .pipe(
                catchError(error => {
                    console.error('Erro ao carregar banco:', error);
                    this.snackBar.open('Erro ao carregar dados do banco.', 'OK', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    return of(null);
                }),
                finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe(bank => {
                if (bank) {
                    console.log('Banco carregado:', bank);

                    this.form.patchValue({
                        code: bank.code || '',
                        name: bank.name || ''
                    });
                }
            });
    }

    save(): void {
        if (this.form.invalid) {
            console.log('Formulário inválido:', this.form.value, this.form.errors);
            this.form.markAllAsTouched();
            this.snackBar.open('Por favor, corrija os erros no formulário.', 'OK', {
                duration: 3000,
                panelClass: ['warning-snackbar']
            });
            return;
        }

        this.saving = true;

        // Preparando dados para enviar
        const formValue = this.form.value;

        // Estrutura para enviar para a API
        const bank: Bank = {
            bankID: this.isEdit && this.data.bank ? this.data.bank.bankID : 0,
            code: formValue.code,
            name: formValue.name
        };

        console.log('Enviando banco para API:', bank);

        const request = this.isEdit && this.data.bank
            ? this.bankService.updateBank(bank.bankID, bank)
            : this.bankService.createBank(bank);

        request
            .pipe(
                catchError(error => {
                    console.error('Erro detalhado ao salvar:', error);
                    const errorMsg = error.error?.message || 'Falha ao comunicar com o servidor';
                    this.snackBar.open(`Erro ao salvar banco: ${errorMsg}`, 'OK', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    return of(null);
                }),
                finalize(() => {
                    this.saving = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe((result) => {
                if (result) {
                    this.snackBar.open('Banco salvo com sucesso!', 'OK', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    this.dialogRef.close(result);
                }
            });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
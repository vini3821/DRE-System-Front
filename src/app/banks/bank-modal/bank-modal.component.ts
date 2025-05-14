import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    template: `
    <h2>{{isEdit ? 'Editar' : 'Novo'}} Banco</h2>
    
    <div *ngIf="loading" style="text-align: center; padding: 20px;">
      <mat-spinner diameter="40" style="margin: 0 auto;"></mat-spinner>
      <p>Carregando dados...</p>
    </div>
    
    <form [formGroup]="form" *ngIf="!loading">
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Código</mat-label>
        <input matInput formControlName="code">
        <mat-error *ngIf="form.get('code')?.hasError('required')">Código é obrigatório</mat-error>
      </mat-form-field>
      
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Nome</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="form.get('name')?.hasError('required')">Nome é obrigatório</mat-error>
      </mat-form-field>
    </form>
    
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || saving" 
              (click)="save()">
        <span *ngIf="!saving">{{isEdit ? 'Atualizar' : 'Salvar'}}</span>
        <span *ngIf="saving">Salvando...</span>
      </button>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      padding: 20px;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 24px;
      color: #5b6bbf;
    }
    
    button[mat-raised-button] {
      margin-left: 8px;
    }
  `]
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
        console.log('Componente inicializado');

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
                    this.snackBar.open('Erro ao carregar dados do banco.', 'OK', { duration: 5000 });
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
            this.snackBar.open('Por favor, corrija os erros no formulário.', 'OK', { duration: 3000 });
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
                    this.snackBar.open(`Erro ao salvar banco: ${errorMsg}`, 'OK', { duration: 5000 });
                    return of(null);
                }),
                finalize(() => {
                    this.saving = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe((result) => {
                if (result) {
                    this.snackBar.open('Banco salvo com sucesso!', 'OK', { duration: 3000 });
                    this.dialogRef.close(result);
                }
            });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
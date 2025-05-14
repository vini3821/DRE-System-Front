import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SectorService, Sector } from '../../services/sector.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-sector-modal',
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
    <h2>{{isEdit ? 'Editar' : 'Novo'}} Setor</h2>
    
    <div *ngIf="loading" style="text-align: center; padding: 20px;">
      <mat-spinner diameter="40" style="margin: 0 auto;"></mat-spinner>
      <p>Carregando dados...</p>
    </div>
    
    <form [formGroup]="form" *ngIf="!loading">
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Nome</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="form.get('name')?.hasError('required')">Nome é obrigatório</mat-error>
      </mat-form-field>
      
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Descrição</mat-label>
        <textarea matInput formControlName="description" rows="3"></textarea>
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
export class SectorModalComponent implements OnInit {
    form: FormGroup;
    isEdit = false;
    loading = false;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<SectorModalComponent>,
        private sectorService: SectorService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: { sector?: Sector }
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit(): void {
        console.log('Componente inicializado');

        // Verifica o modo de edição
        this.isEdit = !!(this.data && this.data.sector);
        console.log('Modo de edição:', this.isEdit);

        if (this.isEdit && this.data.sector) {
            this.loadSector(this.data.sector.sectorID);
        } else {
            this.loading = false;
        }
    }

    loadSector(id: number): void {
        console.log('Carregando setor:', id);
        this.loading = true;

        this.sectorService.getSector(id)
            .pipe(
                catchError(error => {
                    console.error('Erro ao carregar setor:', error);
                    this.snackBar.open('Erro ao carregar dados do setor.', 'OK', { duration: 5000 });
                    return of(null);
                }),
                finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe(sector => {
                if (sector) {
                    console.log('Setor carregado:', sector);

                    this.form.patchValue({
                        name: sector.name || '',
                        description: sector.description || ''
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
        const sector: Sector = {
            sectorID: this.isEdit && this.data.sector ? this.data.sector.sectorID : 0,
            name: formValue.name,
            description: formValue.description
        };

        console.log('Enviando setor para API:', sector);

        const request = this.isEdit && this.data.sector
            ? this.sectorService.updateSector(sector.sectorID, sector)
            : this.sectorService.createSector(sector);

        request
            .pipe(
                catchError(error => {
                    console.error('Erro detalhado ao salvar:', error);
                    const errorMsg = error.error?.message || 'Falha ao comunicar com o servidor';
                    this.snackBar.open(`Erro ao salvar setor: ${errorMsg}`, 'OK', { duration: 5000 });
                    return of(null);
                }),
                finalize(() => {
                    this.saving = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe((result) => {
                if (result) {
                    this.snackBar.open('Setor salvo com sucesso!', 'OK', { duration: 3000 });
                    this.dialogRef.close(result);
                }
            });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
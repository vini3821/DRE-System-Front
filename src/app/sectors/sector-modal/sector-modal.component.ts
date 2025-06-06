// src/app/sectors/sector-modal/sector-modal.component.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
        MatSnackBarModule
    ],
    templateUrl: './sector-modal.component.html',
    styleUrls: ['./sector-modal.component.scss']
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
            description: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        console.log('Modal de setor inicializado');

        // Verifica o modo de edição
        this.isEdit = !!(this.data && this.data.sector);
        console.log('Modo de edição:', this.isEdit);

        if (this.isEdit && this.data.sector) {
            this.loadSector();
        }
    }

    loadSector(): void {
        if (!this.data.sector) return;

        console.log('Carregando setor para edição:', this.data.sector);

        this.form.patchValue({
            name: this.data.sector.name || '',
            description: this.data.sector.description || ''
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

        console.log('Enviando setor para API:', formValue);

        const request = this.isEdit && this.data.sector
            ? this.sectorService.updateSector(
                this.data.sector.sectorID,
                {
                    sectorID: this.data.sector.sectorID,
                    name: formValue.name,
                    description: formValue.description
                }
            )
            : this.sectorService.createSector({
                sectorID: 0,
                name: formValue.name,
                description: formValue.description
            });

        request
            .pipe(
                catchError(error => {
                    console.error('Erro detalhado ao salvar:', error);
                    const errorMsg = error.error?.message || 'Falha ao comunicar com o servidor';
                    this.snackBar.open(`Erro ao salvar setor: ${errorMsg}`, 'OK', {
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
            .subscribe((result: any) => {
                if (result) {
                    this.snackBar.open('Setor salvo com sucesso!', 'OK', {
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
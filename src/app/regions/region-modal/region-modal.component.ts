// src/app/regions/region-modal/region-modal.component.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RegionService, Region } from '../../services/region.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-region-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './region-modal.component.html',
    styleUrls: ['./region-modal.component.scss']
})
export class RegionModalComponent implements OnInit {
    form: FormGroup;
    isEdit = false;
    loading = false;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<RegionModalComponent>,
        private regionService: RegionService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: { region?: Region }
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            code: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        console.log('Modal de região inicializado');

        // Verifica o modo de edição
        this.isEdit = !!(this.data && this.data.region);
        console.log('Modo de edição:', this.isEdit);

        if (this.isEdit && this.data.region) {
            this.loadRegion();
        }
    }

    loadRegion(): void {
        if (!this.data.region) return;

        console.log('Carregando região para edição:', this.data.region);

        this.form.patchValue({
            name: this.data.region.name || '',
            code: this.data.region.code || ''
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

        console.log('Enviando região para API:', formValue);

        const request = this.isEdit && this.data.region
            ? this.regionService.updateRegion(
                this.data.region.regionID,
                {
                    regionID: this.data.region.regionID,
                    name: formValue.name,
                    code: formValue.code
                }
            )
            : this.regionService.createRegion({
                regionID: 0,
                name: formValue.name,
                code: formValue.code
            });

        request
            .pipe(
                catchError(error => {
                    console.error('Erro detalhado ao salvar:', error);
                    const errorMsg = error.error?.message || 'Falha ao comunicar com o servidor';
                    this.snackBar.open(`Erro ao salvar região: ${errorMsg}`, 'OK', {
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
                    this.snackBar.open('Região salva com sucesso!', 'OK', {
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
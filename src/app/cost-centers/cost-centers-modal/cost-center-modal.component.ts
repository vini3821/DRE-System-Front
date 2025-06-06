// src/app/cost-centers/cost-center-modal/cost-center-modal.component.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CostCenterService, CostCenter } from '../../services/cost-center.service';
import { RegionService, Region } from '../../services/region.service';
import { SectorService, Sector } from '../../services/sector.service';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';

@Component({
    selector: 'app-cost-center-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './cost-center-modal.component.html',
    styleUrls: ['./cost-center-modal.component.scss']
})
export class CostCenterModalComponent implements OnInit {
    form: FormGroup;
    regions: Region[] = [];
    sectors: Sector[] = [];
    isEdit = false;
    loading = true;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CostCenterModalComponent>,
        private costCenterService: CostCenterService,
        private regionService: RegionService,
        private sectorService: SectorService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: { costCenter?: CostCenter }
    ) {
        this.form = this.fb.group({
            code: ['', Validators.required],
            description: ['', Validators.required],
            fkRegion: [null],
            fkSector: [null]
        });
    }

    ngOnInit(): void {
        console.log('Componente inicializado');

        // Verifica o modo de edição
        this.isEdit = !!(this.data && this.data.costCenter);
        console.log('Modo de edição:', this.isEdit);

        this.loadData();
    }

    loadData(): void {
        console.log('Carregando dados necessários');

        // Usamos forkJoin para carregar regiões e setores em paralelo
        forkJoin({
            regions: this.regionService.getRegions(),
            sectors: this.sectorService.getSectors()
        })
            .pipe(
                catchError(error => {
                    console.error('Erro ao carregar dados:', error);
                    this.snackBar.open('Erro ao carregar dados. Algumas opções podem não estar disponíveis.', 'OK', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    return of({ regions: [], sectors: [] });
                }),
                finalize(() => {
                    // Se estiver em modo de edição, carrega o centro de custo
                    if (this.isEdit && this.data.costCenter) {
                        this.loadCostCenter(this.data.costCenter.costCenterID);
                    } else {
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                })
            )
            .subscribe(result => {
                console.log('Dados carregados:', result);
                this.regions = result.regions;
                this.sectors = result.sectors;
            });
    }

    loadCostCenter(id: number): void {
        console.log('Carregando centro de custo:', id);

        this.costCenterService.getCostCenter(id)
            .pipe(
                catchError(error => {
                    console.error('Erro ao carregar centro de custo:', error);
                    this.snackBar.open('Erro ao carregar dados do centro de custo.', 'OK', {
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
            .subscribe(costCenter => {
                if (costCenter) {
                    console.log('Centro de custo carregado:', costCenter);

                    this.form.patchValue({
                        code: costCenter.code || '',
                        description: costCenter.description || '',
                        fkRegion: costCenter.fkRegion || null,
                        fkSector: costCenter.fkSector || null
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

        console.log('Enviando centro de custo para API:', formValue);

        const request = this.isEdit && this.data.costCenter
            ? this.costCenterService.updateCostCenter(
                this.data.costCenter.costCenterID,
                {
                    costCenterID: this.data.costCenter.costCenterID,
                    code: formValue.code,
                    description: formValue.description,
                    fkRegion: formValue.fkRegion,
                    fkSector: formValue.fkSector
                }
            )
            : this.costCenterService.createCostCenter({
                costCenterID: 0,
                code: formValue.code,
                description: formValue.description,
                fkRegion: formValue.fkRegion,
                fkSector: formValue.fkSector
            });

        request
            .pipe(
                catchError(error => {
                    console.error('Erro detalhado ao salvar:', error);
                    const errorMsg = error.error?.message || 'Falha ao comunicar com o servidor';
                    this.snackBar.open(`Erro ao salvar centro de custo: ${errorMsg}`, 'OK', {
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
                    this.snackBar.open('Centro de custo salvo com sucesso!', 'OK', {
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
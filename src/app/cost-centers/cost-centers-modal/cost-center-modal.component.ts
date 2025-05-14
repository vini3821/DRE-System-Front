// src/app/cost-centers/cost-center-modal/cost-center-modal.component.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    template: `
    <h2>{{isEdit ? 'Editar' : 'Novo'}} Centro de Custo</h2>
    
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
        <mat-label>Descrição</mat-label>
        <input matInput formControlName="description">
        <mat-error *ngIf="form.get('description')?.hasError('required')">Descrição é obrigatória</mat-error>
      </mat-form-field>
      
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Região</mat-label>
        <mat-select formControlName="fkRegion">
          <mat-option *ngFor="let region of regions" [value]="region.regionID">
            {{region.name}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Setor</mat-label>
        <mat-select formControlName="fkSector">
          <mat-option *ngFor="let sector of sectors" [value]="sector.sectorID">
            {{sector.name}}
          </mat-option>
        </mat-select>
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
                    this.snackBar.open('Erro ao carregar dados. Algumas opções podem não estar disponíveis.', 'OK', { duration: 5000 });
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
                    this.snackBar.open('Erro ao carregar dados do centro de custo.', 'OK', { duration: 5000 });
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
            this.snackBar.open('Por favor, corrija os erros no formulário.', 'OK', { duration: 3000 });
            return;
        }

        this.saving = true;

        // Preparando dados para enviar
        const formValue = this.form.value;

        // Estrutura para enviar para a API - apenas referenciando regiões e setores existentes
        const apiCostCenter = {
            code: formValue.code,
            description: formValue.description,
            fkRegion: formValue.fkRegion,  // Envie apenas o ID da região
            fkSector: formValue.fkSector   // Envie apenas o ID do setor
        };

        console.log('Enviando centro de custo para API (corrigido):', apiCostCenter);

        // Método normal em vez do método Raw, porque já ajustamos o formato
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
                    this.snackBar.open(`Erro ao salvar centro de custo: ${errorMsg}`, 'OK', { duration: 5000 });
                    return of(null);
                }),
                finalize(() => {
                    this.saving = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe((result: any) => {
                if (result) {
                    this.snackBar.open('Centro de custo salvo com sucesso!', 'OK', { duration: 3000 });
                    this.dialogRef.close(result);
                }
            });
    } onCancel(): void {
        this.dialogRef.close();
    }
}
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
import { CollaboratorService } from '../../services/collaborator.service';
import { CostCenterService, CostCenter } from '../../services/cost-center.service';
import { Collaborator } from '../../models/collaborator.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-collaborator-modal',
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
    <h2>{{isEdit ? 'Editar' : 'Novo'}} Colaborador</h2>
    
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
        <mat-label>Centro de Custo</mat-label>
        <mat-select formControlName="fkcc">
          <mat-option *ngFor="let cc of costCenters" [value]="cc.costCenterID">
            {{cc.description}}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="form.get('fkcc')?.hasError('required')">
          Centro de Custo é obrigatório
        </mat-error>
      </mat-form-field>
    </form>
    
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <button mat-button (click)="cancel()">Cancelar</button>
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
export class CollaboratorModalComponent implements OnInit {
  form: FormGroup;
  costCenters: CostCenter[] = [];
  isEdit = false;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CollaboratorModalComponent>,
    private collaboratorService: CollaboratorService,
    private costCenterService: CostCenterService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      fkcc: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('Componente inicializado');

    // Verifica o modo de edição
    this.isEdit = !!(this.data && this.data.collaborator);
    console.log('Modo de edição:', this.isEdit);

    this.loadCostCenters();
  }

  loadCostCenters(): void {
    console.log('Carregando centros de custo');

    this.costCenterService.getCostCenters()
      .pipe(
        catchError(error => {
          console.error('Erro ao carregar centros de custo:', error);
          this.snackBar.open('Erro ao carregar centros de custo. Tente novamente.', 'OK', { duration: 5000 });
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(data => {
        console.log('Centros de custo recebidos:', data);
        this.costCenters = data;

        // Configura o formulário se estiver em modo de edição
        if (this.isEdit && this.data.collaborator) {
          const collaborator = this.data.collaborator;

          this.form.patchValue({
            name: collaborator.name || '',
            fkcc: collaborator.fkcc
          });

          console.log('Formulário preenchido com:', this.form.value);
        }

        this.loading = false;
        this.cdr.detectChanges();
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

    const collaborator: Collaborator = {
      name: this.form.value.name,
      fkcc: this.form.value.fkcc,
      collaboratorID: this.isEdit && this.data.collaborator ? this.data.collaborator.collaboratorID : 0
    };

    console.log('Enviando colaborador:', collaborator);

    const request = this.isEdit && this.data.collaborator
      ? this.collaboratorService.updateCollaborator(collaborator.collaboratorID, collaborator)
      : this.collaboratorService.createCollaborator(collaborator);

    request
      .pipe(
        catchError(error => {
          console.error('Erro ao salvar:', error);
          this.snackBar.open('Erro ao salvar colaborador', 'OK', { duration: 3000 });
          return of(null);
        }),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(result => {
        if (result) {
          this.snackBar.open('Colaborador salvo com sucesso!', 'OK', { duration: 3000 });
          this.dialogRef.close(result);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
import { Component, Inject, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
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
  templateUrl: './collaborator-modal.component.html',
  styleUrls: ['./collaborator-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CollaboratorModalComponent implements OnInit {
  collaboratorForm: FormGroup;
  costCenters: CostCenter[] = [];
  isEdit = false;
  loading = true;
  saving = false;

  // Getters para controles de formulário tipados
  get nameControl(): FormControl {
    return this.collaboratorForm.get('name') as FormControl;
  }

  get centerControl(): FormControl {
    return this.collaboratorForm.get('fkcc') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CollaboratorModalComponent>,
    private collaboratorService: CollaboratorService,
    private costCenterService: CostCenterService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      fkcc: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Definir tamanho do modal menor
    if (this.dialogRef) {
      this.dialogRef.updateSize('420px', 'auto'); // Reduzido de 450px
      this.dialogRef.addPanelClass('collaborator-modal-dialog');

      // Configuração extra para remover as barras de rolagem
      setTimeout(() => {
        // Remover barras de rolagem de maneira direta
        document.querySelectorAll('.mat-dialog-container, .cdk-overlay-pane, body').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.overflow = 'hidden';
            // Remova a linha com msOverflowStyle pois não é válida em TypeScript
            // Podemos usar um atributo data personalizado como alternativa
            el.setAttribute('data-no-scroll', 'true');
          }
        });

        // Verificar se há barras de rolagem e ajustar altura se necessário
        const modalContent = document.querySelector('.modal-container') as HTMLElement;
        if (modalContent) {
          const viewportHeight = window.innerHeight;
          const modalHeight = modalContent.offsetHeight;

          // Se o modal for maior que o viewport, ajustar altura
          if (modalHeight > viewportHeight - 40) {
            this.dialogRef.updateSize('420px', `${viewportHeight - 40}px`);
          }
        }
      }, 10);
    }

    // Resto do código permanece igual
    console.log('Componente inicializado');
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

          this.collaboratorForm.patchValue({
            name: collaborator.name || '',
            fkcc: collaborator.fkcc
          });

          console.log('Formulário preenchido com:', this.collaboratorForm.value);
        }

        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  onSubmit(): void {
    if (this.collaboratorForm.invalid) {
      console.log('Formulário inválido:', this.collaboratorForm.value, this.collaboratorForm.errors);
      this.collaboratorForm.markAllAsTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'OK', { duration: 3000 });
      return;
    }

    this.saving = true;

    const collaborator: Collaborator = {
      name: this.collaboratorForm.value.name,
      fkcc: this.collaboratorForm.value.fkcc,
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
          this.snackBar.open('Erro ao salvar colaborador', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar'] // Classe para estilizar mensagens de erro
          });
          return of(null);
        }),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(result => {
        if (result) {
          // Mensagem de sucesso estilizada
          this.snackBar.open(
            'Colaborador ' + (this.isEdit ? 'atualizado' : 'criado') + ' com sucesso!',
            'Fechar',
            {
              duration: 5000,
              panelClass: ['success-snackbar'], // Classe para estilizar mensagens de sucesso
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            }
          );
          this.dialogRef.close(result);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
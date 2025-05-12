// src/app/entries/entry-modal/entry-modal.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Adicionar MatNativeDateModule
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EntriesService } from '../../services/entries.service';
import { CollaboratorService } from '../../services/collaborator.service';
import { BankService } from '../../services/bank.service';
import { Entry } from '../../models/entry.model';
import { Collaborator } from '../../models/collaborator.model';
import { Bank } from '../../models/bank.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-entry-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule, // Adicionar nos imports
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSnackBarModule
    ],
    templateUrl: './entry-modal.component.html',
    styleUrls: ['./entry-modal.component.scss']
})
export class EntryModalComponent implements OnInit {
    entryForm: FormGroup;
    collaborators: Collaborator[] = [];
    banks: Bank[] = [];
    isEdit = false;
    loading = false;
    submitLoading = false;

    constructor(
        private formBuilder: FormBuilder,
        private entriesService: EntriesService,
        private collaboratorService: CollaboratorService,
        private bankService: BankService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<EntryModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { entry?: Entry }
    ) {
        console.log('EntryModalComponent construtor iniciado', data);
        this.entryForm = this.formBuilder.group({
            entryDate: [new Date(), Validators.required],
            entryType: ['Receita', Validators.required],
            value: [null, [Validators.required, Validators.min(0.01)]],
            fkc: [null, Validators.required],
            fkBank: [null]
        });

        if (data && data.entry) {
            this.isEdit = true;
        }
    }

    ngOnInit() {
        console.log('EntryModalComponent ngOnInit');
        this.loading = true;

        // Carregar dados
        this.loadInitialData();

        // Preencher o formulário se estiver em modo de edição
        if (this.isEdit && this.data.entry) {
            this.patchFormValues(this.data.entry);
        }
    }

    private loadInitialData() {
        // Promise.all para carregar todos os dados necessários
        console.log('Carregando dados iniciais');

        Promise.all([
            this.loadCollaboratorsPromise(),
            this.loadBanksPromise()
        ]).then(() => {
            console.log('Todos os dados carregados');
            this.loading = false;
        }).catch(error => {
            console.error('Erro ao carregar dados iniciais', error);
            this.loading = false;
            this.snackBar.open('Alguns dados não puderam ser carregados', 'Fechar', {
                duration: 3000
            });
        });
    }

    loadCollaboratorsPromise(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.collaboratorService.getCollaborators()
                .pipe(
                    catchError(error => {
                        console.error('Erro ao carregar colaboradores', error);
                        return of([]);
                    })
                )
                .subscribe({
                    next: (data) => {
                        this.collaborators = data || [];
                        console.log('Colaboradores carregados:', this.collaborators.length);
                        resolve();
                    },
                    error: (error) => {
                        console.error('Erro ao carregar colaboradores', error);
                        reject(error);
                    }
                });
        });
    }

    loadBanksPromise(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.bankService.getBanks()
                .pipe(
                    catchError(error => {
                        console.error('Erro ao carregar bancos', error);
                        return of([]);
                    })
                )
                .subscribe({
                    next: (data) => {
                        this.banks = data || [];
                        console.log('Bancos carregados:', this.banks.length);
                        resolve();
                    },
                    error: (error) => {
                        console.error('Erro ao carregar bancos', error);
                        reject(error);
                    }
                });
        });
    }

    patchFormValues(entry: Entry) {
        console.log('Preenchendo formulário com dados:', entry);
        this.entryForm.patchValue({
            entryDate: new Date(entry.entryDate),
            entryType: entry.entryType,
            value: entry.value,
            fkc: entry.fkc,
            fkBank: entry.fkBank
        });
    }

    onSubmit() {
        console.log('Formulário submetido, validando...');
        if (this.entryForm.invalid) {
            console.log('Formulário inválido:', this.entryForm.errors);
            return;
        }

        this.submitLoading = true;
        const entryData: Entry = this.entryForm.value;
        console.log('Dados do formulário:', entryData);

        if (this.isEdit && this.data.entry) {
            console.log('Atualizando lançamento ID:', this.data.entry.entryID);
            this.entriesService.updateEntry(this.data.entry.entryID, entryData)
                .pipe(
                    catchError(error => {
                        console.error('Erro ao atualizar lançamento', error);
                        this.snackBar.open('Erro ao atualizar lançamento', 'Fechar', { duration: 3000 });
                        return of(null);
                    }),
                    finalize(() => {
                        this.submitLoading = false;
                    })
                )
                .subscribe(result => {
                    if (result) {
                        this.snackBar.open('Lançamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
                        this.dialogRef.close(result);
                    }
                });
        } else {
            console.log('Criando novo lançamento');
            this.entriesService.createEntry(entryData)
                .pipe(
                    catchError(error => {
                        console.error('Erro ao criar lançamento', error);
                        this.snackBar.open('Erro ao criar lançamento', 'Fechar', { duration: 3000 });
                        return of(null);
                    }),
                    finalize(() => {
                        this.submitLoading = false;
                    })
                )
                .subscribe(result => {
                    if (result) {
                        this.snackBar.open('Lançamento criado com sucesso!', 'Fechar', { duration: 3000 });
                        this.dialogRef.close(result);
                    }
                });
        }
    }

    onCancel() {
        console.log('Cancelando formulário');
        this.dialogRef.close();
    }
}
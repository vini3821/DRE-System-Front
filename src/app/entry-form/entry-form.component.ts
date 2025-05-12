// src/app/entry-form/entry-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EntriesService } from '../services/entries.service';
import { CollaboratorService } from '../services/collaborator.service';
import { BankService } from '../services/bank.service';
import { Entry } from '../models/entry.model';
import { Collaborator } from '../models/collaborator.model';
import { Bank } from '../models/bank.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule, // Adicionado aqui
        MatButtonModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        RouterModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss']
})
export class EntryFormComponent implements OnInit {
    entryForm: FormGroup;
    collaborators: Collaborator[] = [];
    banks: Bank[] = [];
    isEdit = false;
    entryId: number | null = null;
    loading = false;
    submitLoading = false;
    loadingCollaborators = false;
    loadingBanks = false;

    constructor(
        private formBuilder: FormBuilder,
        private entriesService: EntriesService,
        private collaboratorService: CollaboratorService,
        private bankService: BankService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        console.log('EntryFormComponent construtor iniciado');
        this.entryForm = this.formBuilder.group({
            entryDate: [new Date(), Validators.required],
            entryType: ['Receita', Validators.required],
            value: [null, [Validators.required, Validators.min(0.01)]],
            fkc: [null, Validators.required],
            fkBank: [null]
        });
    }

    ngOnInit() {
        console.log('EntryFormComponent - ngOnInit iniciado');
        this.loading = true;

        // Carrega dados básicos mesmo que ocorram erros
        this.loadInitialData();

        // Check if edit mode
        this.route.params.subscribe(params => {
            console.log('EntryFormComponent - params recebidos:', params);
            if (params['id']) {
                this.isEdit = true;
                this.entryId = +params['id'];
                this.loadEntry(this.entryId);
            } else {
                // Se não for modo de edição, garantir que loading seja alterado para false
                setTimeout(() => {
                    if (this.loading) {
                        console.log('EntryFormComponent - forçando loading para false (timeout)');
                        this.loading = false;
                    }
                }, 2000);
            }
        });
    }

    private loadInitialData() {
        try {
            this.loadCollaborators();
            this.loadBanks();
        } catch (error) {
            console.error('EntryFormComponent - Erro ao carregar dados iniciais:', error);
            this.loading = false;
            this.snackBar.open('Erro ao carregar dados iniciais. O formulário pode não funcionar corretamente.', 'OK');
        }
    }

    loadEntry(id: number) {
        console.log(`EntryFormComponent - carregando entrada ${id}`);
        this.entriesService.getEntry(id)
            .pipe(
                catchError(error => {
                    console.error('EntryFormComponent - Erro ao carregar entrada:', error);
                    this.snackBar.open('Erro ao carregar o lançamento. Tente novamente.', 'OK');
                    this.loading = false;
                    return of(null);
                }),
                finalize(() => {
                    console.log('EntryFormComponent - finalizou carregamento da entrada');
                    // Garante que loading ficará falso mesmo se a operação falhar
                    setTimeout(() => this.loading = false, 0);
                })
            )
            .subscribe(entry => {
                if (entry) {
                    console.log('EntryFormComponent - dados da entrada recebidos:', entry);
                    this.entryForm.patchValue({
                        entryDate: new Date(entry.entryDate),
                        entryType: entry.entryType,
                        value: entry.value,
                        fkc: entry.fkc,
                        fkBank: entry.fkBank
                    });
                }
                this.loading = false;
            });
    }

    loadCollaborators() {
        console.log('EntryFormComponent - carregando colaboradores');
        this.loadingCollaborators = true;
        this.collaboratorService.getCollaborators()
            .pipe(
                catchError(error => {
                    console.error('EntryFormComponent - Erro ao carregar colaboradores:', error);
                    this.snackBar.open('Erro ao carregar colaboradores. Alguns dados podem estar incompletos.', 'OK');
                    this.loadingCollaborators = false;
                    return of([]);
                }),
                finalize(() => {
                    this.loadingCollaborators = false;
                    this.checkLoadingComplete();
                })
            )
            .subscribe(data => {
                console.log('EntryFormComponent - colaboradores carregados:', data?.length || 0);
                this.collaborators = data || [];
            });
    }

    loadBanks() {
        console.log('EntryFormComponent - carregando bancos');
        this.loadingBanks = true;
        this.bankService.getBanks()
            .pipe(
                catchError(error => {
                    console.error('EntryFormComponent - Erro ao carregar bancos:', error);
                    this.snackBar.open('Erro ao carregar bancos. Alguns dados podem estar incompletos.', 'OK');
                    this.loadingBanks = false;
                    return of([]);
                }),
                finalize(() => {
                    this.loadingBanks = false;
                    this.checkLoadingComplete();
                })
            )
            .subscribe(data => {
                console.log('EntryFormComponent - bancos carregados:', data?.length || 0);
                this.banks = data || [];
            });
    }

    checkLoadingComplete() {
        if (!this.loadingCollaborators && !this.loadingBanks && !this.isEdit) {
            console.log('EntryFormComponent - todos os dados carregados, alterando loading para false');
            this.loading = false;
        }
    }

    onSubmit() {
        console.log('EntryFormComponent - formulário submetido');
        if (this.entryForm.invalid) {
            console.log('EntryFormComponent - formulário inválido:', this.entryForm.errors);
            return;
        }

        this.submitLoading = true;
        const entryData = this.entryForm.value;
        console.log('EntryFormComponent - dados do formulário:', entryData);

        if (this.isEdit && this.entryId) {
            this.entriesService.updateEntry(this.entryId, entryData)
                .pipe(
                    catchError(error => {
                        console.error('EntryFormComponent - Erro ao atualizar entrada:', error);
                        this.snackBar.open('Erro ao atualizar lançamento!', 'Fechar', { duration: 3000 });
                        this.submitLoading = false;
                        return of(null);
                    }),
                    finalize(() => {
                        console.log('EntryFormComponent - finalizou atualização');
                        // Garante que submitLoading ficará falso mesmo se a operação falhar
                        setTimeout(() => this.submitLoading = false, 0);
                    })
                )
                .subscribe(result => {
                    if (result) {
                        this.router.navigate(['/entries']);
                        this.snackBar.open('Lançamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
                    }
                });
        } else {
            this.entriesService.createEntry(entryData)
                .pipe(
                    catchError(error => {
                        console.error('EntryFormComponent - Erro ao criar entrada:', error);
                        this.snackBar.open('Erro ao criar lançamento!', 'Fechar', { duration: 3000 });
                        this.submitLoading = false;
                        return of(null);
                    }),
                    finalize(() => {
                        console.log('EntryFormComponent - finalizou criação');
                        // Garante que submitLoading ficará falso mesmo se a operação falhar
                        setTimeout(() => this.submitLoading = false, 0);
                    })
                )
                .subscribe(result => {
                    if (result) {
                        this.router.navigate(['/entries']);
                        this.snackBar.open('Lançamento criado com sucesso!', 'Fechar', { duration: 3000 });
                    }
                });
        }
    }
}
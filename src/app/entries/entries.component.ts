// entries.component.ts - Versão corrigida com tratamento de erros
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';
import { EntriesService } from '../services/entries.service';
import { Entry } from '../models/entry.model';
import { EntryModalComponent } from './entry-modal/entry-modal.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-entries',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatDialogModule,
        RouterModule
    ],
    templateUrl: './entries.component.html',
    styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit {
    entries: Entry[] = [];
    loading = false;
    displayedColumns: string[] = ['date', 'type', 'value', 'collaborator', 'costCenter', 'actions'];

    constructor(
        private entriesService: EntriesService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) { }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    ngOnInit() {
        this.loading = true;
        this.loadEntries();
    }

    loadEntries() {
        this.entriesService.getEntries()
            .pipe(
                catchError(error => {
                    console.error('Erro ao carregar lançamentos', error);
                    this.snackBar.open('Erro ao carregar dados. Usando dados em cache ou mockados temporariamente.', 'Fechar', {
                        duration: 5000
                    });
                    // Retorna uma lista vazia ou dados mockados para não quebrar a UI
                    return of([]);
                }),
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe(data => {
                this.entries = data;
            });
    }

    openEntryModal(entry?: Entry) {
        console.log('Abrindo modal de lançamento', entry);

        const dialogRef = this.dialog.open(EntryModalComponent, {
            width: '800px',
            disableClose: false,
            data: { entry },
            // Permitir clicar fora para fechar
            hasBackdrop: true,
            panelClass: 'entry-modal-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal fechado com resultado:', result);
            if (result) {
                // Recarregar a lista se houver alterações
                this.loadEntries();
            }
        });
    }

    confirmDelete(entryId: number) {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            this.deleteEntry(entryId);
        }
    }

    deleteEntry(entryId: number) {
        this.entriesService.deleteEntry(entryId)
            .pipe(
                catchError(error => {
                    console.error(`Erro ao excluir lançamento com ID ${entryId}`, error);
                    this.snackBar.open('Erro ao excluir lançamento', 'Fechar', {
                        duration: 3000
                    });
                    return of(null);
                })
            )
            .subscribe(result => {
                if (result !== null) {
                    this.entries = this.entries.filter(e => e.entryID !== entryId);
                    this.snackBar.open('Lançamento excluído com sucesso!', 'Fechar', {
                        duration: 3000
                    });
                }
            });
    }
}
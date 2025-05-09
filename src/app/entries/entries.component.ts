// src/app/entries/entries.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../services/entries.service';
import { Entry } from '../models/entry.model';

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
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loading = true;
        this.loadEntries();
    }

    loadEntries() {
        this.entriesService.getEntries().subscribe({
            next: (data) => {
                this.entries = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar lançamentos', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    confirmDelete(entryId: number) {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            this.deleteEntry(entryId);
        }
    }

    deleteEntry(entryId: number) {
        this.entriesService.deleteEntry(entryId).subscribe({
            next: () => {
                this.entries = this.entries.filter(e => e.entryID !== entryId);
                this.snackBar.open('Lançamento excluído com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir lançamento com ID ${entryId}`, error);
                this.snackBar.open('Erro ao excluir lançamento', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
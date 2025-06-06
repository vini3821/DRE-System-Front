// collaborators.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { CollaboratorService } from '../services/collaborator.service';
import { Collaborator } from '../models/collaborator.model';
import { CollaboratorModalComponent } from '../collaborators/collaborator-modal/collaborator-modal.component';
import { Router } from '@angular/router';


@Component({
    selector: 'app-collaborators',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatRippleModule,
        MatSnackBarModule,
        MatDialogModule,
        RouterModule
    ],
    templateUrl: './collaborators.component.html',
    styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {
    collaborators: Collaborator[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'costCenter', 'actions'];

    constructor(
        private collaboratorService: CollaboratorService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) { }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    ngOnInit() {
        this.loading = true;
        this.loadCollaborators();
    }

    loadCollaborators() {
        this.collaboratorService.getCollaborators().subscribe({
            next: (data) => {
                this.collaborators = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar colaboradores', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    openCollaboratorModal(collaborator?: Collaborator) {
        console.log('Abrindo modal de colaborador', collaborator);

        const dialogRef = this.dialog.open(CollaboratorModalComponent, {
            width: '600px',
            disableClose: false,
            data: { collaborator },
            autoFocus: true,
            panelClass: ['animated', 'fadeIn', 'custom-dialog-container'],
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal fechado com resultado:', result);
            if (result) {
                this.loadCollaborators();
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este colaborador?')) {
            this.deleteCollaborator(id);
        }
    }

    deleteCollaborator(id: number) {
        this.collaboratorService.deleteCollaborator(id).subscribe({
            next: () => {
                this.collaborators = this.collaborators.filter(c => c.collaboratorID !== id);
                this.snackBar.open('Colaborador excluído com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir colaborador com ID ${id}`, error);
                this.snackBar.open('Erro ao excluir colaborador', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
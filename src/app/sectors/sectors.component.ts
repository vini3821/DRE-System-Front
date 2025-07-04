import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule, Router } from '@angular/router';
import { SectorService, Sector } from '../services/sector.service';
import { SectorModalComponent } from './sector-modal/sector-modal.component';

@Component({
    selector: 'app-sectors',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTooltipModule,
        MatRippleModule,
        RouterModule,

    ],
    templateUrl: './sectors.component.html',
    styleUrls: ['./sectors.component.scss']
})
export class SectorsComponent implements OnInit {
    sectors: Sector[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'description', 'actions'];

    constructor(
        private sectorService: SectorService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) { }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    ngOnInit() {
        this.loading = true;
        this.loadSectors();
    }

    loadSectors() {
        this.sectorService.getSectors().subscribe({
            next: (data) => {
                this.sectors = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar setores', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    openSectorModal(sector?: Sector) {
        console.log('Abrindo modal de setor', sector);

        const dialogRef = this.dialog.open(SectorModalComponent, {
            width: '600px',
            disableClose: false,
            data: { sector },
            autoFocus: true,
            panelClass: ['animated', 'fadeIn', 'custom-dialog-container'],
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal fechado com resultado:', result);
            if (result) {
                this.loadSectors();
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este setor?')) {
            this.deleteSector(id);
        }
    }

    deleteSector(id: number) {
        this.sectorService.deleteSector(id).subscribe({
            next: () => {
                this.sectors = this.sectors.filter(s => s.sectorID !== id);
                this.snackBar.open('Setor excluído com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir setor com ID ${id}`, error);
                this.snackBar.open('Erro ao excluir setor', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
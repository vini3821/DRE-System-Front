import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegionService, Region } from '../services/region.service';
import { RegionModalComponent } from './region-modal/region-modal.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-regions',
    standalone: true,
    imports: [
        CommonModule,
        MatSnackBarModule,
        MatDialogModule
    ],
    templateUrl: './regions.component.html',
    styleUrls: ['./regions.component.scss']
})
export class RegionsComponent implements OnInit {
    regions: Region[] = [];
    loading = false;

    constructor(
        private regionService: RegionService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) { }


    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }
    ngOnInit() {
        this.loadRegions();
    }


    loadRegions() {
        this.loading = true;

        this.regionService.getRegions().subscribe({
            next: (data) => {
                console.log('Regiões carregadas:', data);
                this.regions = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar regiões', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'OK', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
                this.loading = false;
            }
        });
    }

    openRegionModal(region?: Region) {
        console.log('Abrindo modal de região', region);

        const dialogRef = this.dialog.open(RegionModalComponent, {
            width: '400px',
            disableClose: false,
            data: { region },
            autoFocus: false,
            panelClass: ['custom-dialog-container'],
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal fechado com resultado:', result);
            if (result) {
                this.loadRegions();
                this.snackBar.open(
                    region ? 'Região atualizada com sucesso!' : 'Região criada com sucesso!',
                    'OK',
                    {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    }
                );
            }
        });
    }

    confirmDelete(id: number) {
        const region = this.regions.find(r => r.regionID === id);
        const regionName = region ? region.name : 'esta região';

        if (confirm(`Tem certeza que deseja excluir "${regionName}"? Esta ação não pode ser desfeita.`)) {
            this.deleteRegion(id);
        }
    }

    deleteRegion(id: number) {
        this.regionService.deleteRegion(id).subscribe({
            next: () => {
                this.regions = this.regions.filter(r => r.regionID !== id);
                this.snackBar.open('Região excluída com sucesso!', 'OK', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir região com ID ${id}`, error);
                this.snackBar.open('Erro ao excluir região. Tente novamente.', 'OK', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }
}
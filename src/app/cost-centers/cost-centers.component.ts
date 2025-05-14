// src/app/cost-centers/cost-centers.component.ts
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
import { RouterModule } from '@angular/router';
import { CostCenterService, CostCenter } from '../services/cost-center.service';
import { CostCenterModalComponent } from './cost-centers-modal/cost-center-modal.component';

@Component({
    selector: 'app-cost-centers',
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
        RouterModule
    ],
    templateUrl: './cost-centers.component.html',
    styleUrls: ['./cost-centers.component.scss']
})
export class CostCentersComponent implements OnInit {
    costCenters: CostCenter[] = [];
    loading = false;
    displayedColumns: string[] = ['description', 'actions'];

    constructor(
        private costCenterService: CostCenterService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.loading = true;
        this.loadCostCenters();
    }

    loadCostCenters() {
        this.costCenterService.getCostCenters().subscribe({
            next: (data) => {
                this.costCenters = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar centros de custo', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    openCostCenterModal(costCenter?: CostCenter) {
        console.log('Abrindo modal de centro de custo', costCenter);

        const dialogRef = this.dialog.open(CostCenterModalComponent, {
            width: '600px',
            disableClose: false,
            data: { costCenter },
            autoFocus: true,
            panelClass: ['animated', 'fadeIn', 'custom-dialog-container'],
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal fechado com resultado:', result);
            if (result) {
                this.loadCostCenters();
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
            this.deleteCostCenter(id);
        }
    }

    deleteCostCenter(id: number) {
        this.costCenterService.deleteCostCenter(id).subscribe({
            next: () => {
                this.costCenters = this.costCenters.filter(cc => cc.costCenterID !== id);
                this.snackBar.open('Centro de custo excluído com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir centro de custo com ID ${id}`, error);
                this.snackBar.open('Erro ao excluir centro de custo', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
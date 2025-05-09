// src/app/regions/regions.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { RegionService, Region } from '../services/region.service';

@Component({
    selector: 'app-regions',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSnackBarModule,
        RouterModule
    ],
    templateUrl: './regions.component.html',
    styleUrls: ['./regions.component.scss']
})
export class RegionsComponent implements OnInit {
    regions: Region[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'code', 'actions'];

    constructor(
        private regionService: RegionService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loading = true;
        this.loadRegions();
    }

    loadRegions() {
        this.regionService.getRegions().subscribe({
            next: (data) => {
                this.regions = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar regiões', error);
                this.snackBar.open('Erro ao carregar dados. Verifique a conexão com o servidor.', 'Fechar', {
                    duration: 5000
                });
                this.loading = false;
            }
        });
    }

    confirmDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir esta região?')) {
            this.deleteRegion(id);
        }
    }

    deleteRegion(id: number) {
        this.regionService.deleteRegion(id).subscribe({
            next: () => {
                this.regions = this.regions.filter(r => r.regionID !== id);
                this.snackBar.open('Região excluída com sucesso!', 'Fechar', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error(`Erro ao excluir região com ID ${id}`, error);
                this.snackBar.open('Erro ao excluir região', 'Fechar', {
                    duration: 3000
                });
            }
        });
    }
}
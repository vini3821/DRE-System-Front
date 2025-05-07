// collaborators.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

// Modelo básico para Colaborador
interface Collaborator {
  collaboratorID: number;
  name: string;
  costCenter?: {
    description: string;
  };
}

// Serviço temporário simulado
class CollaboratorService {
  getCollaborators() {
    return {
      subscribe: (callbacks: any) => {
        // Dados simulados
        const collaborators = [
          { collaboratorID: 1, name: 'João Silva', costCenter: { description: 'Financeiro' } },
          { collaboratorID: 2, name: 'Maria Santos', costCenter: { description: 'Marketing' } },
          { collaboratorID: 3, name: 'Carlos Oliveira', costCenter: { description: 'TI' } },
          { collaboratorID: 4, name: 'Ana Pereira', costCenter: { description: 'Recursos Humanos' } }
        ];
        
        // Simula um atraso de rede
        setTimeout(() => {
          callbacks.next(collaborators);
        }, 500);
      }
    };
  }
}

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
    RouterModule
  ],
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss'],
  providers: [CollaboratorService]
})
export class CollaboratorsComponent implements OnInit {
  collaborators: Collaborator[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'costCenter', 'actions'];

  constructor(private collaboratorService: CollaboratorService) { }

  ngOnInit() {
    this.loading = true;
    this.collaboratorService.getCollaborators().subscribe({
      next: (data: any) => {
        this.collaborators = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading collaborators', error);
        this.loading = false;
      }
    });
  }

  confirmDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      // Implementação simulada de exclusão
      this.collaborators = this.collaborators.filter(c => c.collaboratorID !== id);
    }
  }
}
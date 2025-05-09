import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SectorService, Sector } from '../services/sector.service';

@Component({
  selector: 'app-sector-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './sector-form.component.html',
  styleUrls: ['./sector-form.component.scss']
})
export class SectorFormComponent implements OnInit {
  sectorForm: FormGroup;
  isEdit = false;
  sectorId: number | null = null;
  loading = false;
  submitLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private sectorService: SectorService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.sectorForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loading = true;

    // Verifica se é modo de edição
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.sectorId = +params['id'];
        this.loadSector(this.sectorId);
      } else {
        this.loading = false;
      }
    });
  }

  loadSector(id: number) {
    this.sectorService.getSector(id).subscribe({
      next: (sector) => {
        this.sectorForm.patchValue({
          name: sector.name,
          description: sector.description
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar setor', error);
        this.snackBar.open('Erro ao carregar dados do setor', 'Fechar', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.sectorForm.invalid) {
      return;
    }

    this.submitLoading = true;
    const sectorData: Sector = this.sectorForm.value;

    if (this.isEdit && this.sectorId) {
      // Atualiza setor existente
      this.sectorService.updateSector(this.sectorId, sectorData).subscribe({
        next: () => {
          this.snackBar.open('Setor atualizado com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/sectors']);
        },
        error: (error) => {
          console.error('Erro ao atualizar setor', error);
          this.snackBar.open('Erro ao atualizar setor', 'Fechar', {
            duration: 3000
          });
          this.submitLoading = false;
        }
      });
    } else {
      // Cria novo setor
      this.sectorService.createSector(sectorData).subscribe({
        next: () => {
          this.snackBar.open('Setor criado com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/sectors']);
        },
        error: (error) => {
          console.error('Erro ao criar setor', error);
          this.snackBar.open('Erro ao criar setor', 'Fechar', {
            duration: 3000
          });
          this.submitLoading = false;
        }
      });
    }
  }
}
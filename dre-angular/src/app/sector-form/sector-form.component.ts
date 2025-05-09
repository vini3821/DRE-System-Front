// Exemplo para sector-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SectorService, Sector } from '../services/sector.service';
import { finalize } from 'rxjs/operators';

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
    MatProgressBarModule,
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

  // Getters de controle para uso seguro no template
  get nameControl(): AbstractControl | null {
    return this.sectorForm.get('name');
  }

  get descriptionControl(): AbstractControl | null {
    return this.sectorForm.get('description');
  }

  loadSector(id: number) {
    this.sectorService.getSector(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (sector) => {
          if (sector) {
            this.sectorForm.patchValue({
              name: sector.name || '',
              description: sector.description || ''
            });
          } else {
            this.snackBar.open('Setor não encontrado', 'Fechar', {
              duration: 3000
            });
            this.router.navigate(['/sectors']);
          }
        },
        error: (error) => {
          console.error('Erro ao carregar setor', error);
          this.snackBar.open('Erro ao carregar dados do setor', 'Fechar', {
            duration: 3000
          });
        }
      });
  }

  onSubmit() {
    if (this.sectorForm.invalid) {
      return;
    }

    this.submitLoading = true;
    const sectorData: Sector = {
      sectorID: this.sectorId || 0,
      name: this.sectorForm.value.name || '',
      description: this.sectorForm.value.description
    };

    const request = this.isEdit && this.sectorId 
      ? this.sectorService.updateSector(this.sectorId, sectorData)
      : this.sectorService.createSector(sectorData);

    request
      .pipe(finalize(() => this.submitLoading = false))
      .subscribe({
        next: () => {
          const message = this.isEdit ? 'Setor atualizado com sucesso!' : 'Setor criado com sucesso!';
          this.snackBar.open(message, 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/sectors']);
        },
        error: (error) => {
          console.error(this.isEdit ? 'Erro ao atualizar setor' : 'Erro ao criar setor', error);
          this.snackBar.open(
            this.isEdit ? 'Erro ao atualizar setor' : 'Erro ao criar setor', 
            'Fechar', 
            { duration: 3000 }
          );
        }
      });
  }
}
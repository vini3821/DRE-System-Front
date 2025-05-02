import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntriesService } from '../services/entries.service';
import { CollaboratorService } from '../services/collaborator.service';
import { BankService } from '../services/bank.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Entry } from '../models/entry.model';
import { Collaborator } from '../models/collaborator.model';
import { Bank } from '../models/bank.model';

@Component({
    selector: 'app-entry-form',
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss']
})
export class EntryFormComponent implements OnInit {
    entryForm: FormGroup;
    collaborators: Collaborator[] = [];
    banks: Bank[] = [];
    isEdit = false;
    entryId: number | null = null;
    loading = false;
    submitLoading = false;

    constructor(
        private formBuilder: FormBuilder,
        private entriesService: EntriesService,
        private collaboratorService: CollaboratorService,
        private bankService: BankService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.entryForm = this.formBuilder.group({
            entryDate: [new Date(), Validators.required],
            entryType: ['Receita', Validators.required],
            value: [null, [Validators.required, Validators.min(0.01)]],
            fkc: [null, Validators.required],
            fkBank: [null]
        });
    }

    ngOnInit() {
        this.loading = true;

        // Check if edit mode
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.entryId = +params['id'];
                this.loadEntry(this.entryId);
            }
        });

        // Load collaborators and banks
        this.loadCollaborators();
        this.loadBanks();
    }

    loadEntry(id: number) {
        this.entriesService.getEntry(id).subscribe({
            next: (entry) => {
                this.entryForm.patchValue({
                    entryDate: new Date(entry.entryDate),
                    entryType: entry.entryType,
                    value: entry.value,
                    fkc: entry.fkc,
                    fkBank: entry.fkBank
                });
            },
            error: (error) => {
                console.error('Error loading entry', error);
            }
        });
    }

    loadCollaborators() {
        this.collaboratorService.getCollaborators().subscribe({
            next: (data) => {
                this.collaborators = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading collaborators', error);
                this.loading = false;
            }
        });
    }

    loadBanks() {
        this.bankService.getBanks().subscribe({
            next: (data) => {
                this.banks = data;
            },
            error: (error) => {
                console.error('Error loading banks', error);
            }
        });
    }

    onSubmit() {
        if (this.entryForm.invalid) {
            return;
        }

        this.submitLoading = true;
        const entryData = this.entryForm.value;

        if (this.isEdit && this.entryId) {
            this.entriesService.updateEntry(this.entryId, entryData).subscribe({
                next: () => {
                    this.router.navigate(['/entries']);
                },
                error: (error) => {
                    console.error('Error updating entry', error);
                    this.submitLoading = false;
                }
            });
        } else {
            this.entriesService.createEntry(entryData).subscribe({
                next: () => {
                    this.router.navigate(['/entries']);
                },
                error: (error) => {
                    console.error('Error creating entry', error);
                    this.submitLoading = false;
                }
            });
        }
    }
}
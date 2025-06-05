// src/app/entry-form/entry-form.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EntriesService } from '../services/entries.service';
import { CollaboratorService } from '../services/collaborator.service';
import { BankService } from '../services/bank.service';
import { Entry } from '../models/entry.model';
import { Collaborator } from '../models/collaborator.model';
import { Bank } from '../models/bank.model';
import { catchError, finalize, of } from 'rxjs';
import { MAT_DATE_FORMATS } from '@angular/material/core';

const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

interface CalendarDay {
    date: number;
    fullDate: Date;
    currentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
}

@Component({
    selector: 'app-entry-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        RouterModule,
        MatIconModule,
        MatSnackBarModule,
    ],
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
    ]
})
export class EntryFormComponent implements OnInit {
    entryForm: FormGroup;
    collaborators: Collaborator[] = [];
    banks: Bank[] = [];
    isEdit = false;
    entryId: number | null = null;
    loading = false;
    submitLoading = false;
    loadingCollaborators = false;
    loadingBanks = false;

    // Propriedades para o calendário customizado
    showCustomCalendar = false;
    currentMonth = '';
    currentYear = 0;
    currentMonthIndex = 0;
    calendarDays: CalendarDay[] = [];
    selectedDate: Date | null = null;

    monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    monthsLong = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    constructor(
        private formBuilder: FormBuilder,
        private entriesService: EntriesService,
        private collaboratorService: CollaboratorService,
        private bankService: BankService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.entryForm = this.formBuilder.group({
            entryDate: [new Date(), Validators.required],
            entryType: ['Receita', Validators.required],
            value: [null, [Validators.required, Validators.min(0.01)]],
            fkc: [null, Validators.required],
            fkBank: [null],
            description: ['']
        });

        this.initializeCalendar();
    }

    ngOnInit() {
        this.loading = true;
        this.loadInitialData();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.entryId = +params['id'];
                this.loadEntry(this.entryId);
            } else {
                setTimeout(() => {
                    if (this.loading) {
                        this.loading = false;
                    }
                }, 2000);
            }
        });
    }

    // ========== MÉTODOS PRINCIPAIS ==========

    private loadInitialData() {
        try {
            this.loadCollaborators();
            this.loadBanks();
        } catch (error) {
            this.loading = false;
            this.snackBar.open('Erro ao carregar dados iniciais. O formulário pode não funcionar corretamente.', 'OK');
        }
    }

    loadEntry(id: number) {
        this.entriesService.getEntry(id)
            .pipe(
                catchError(error => {
                    this.snackBar.open('Erro ao carregar o lançamento. Tente novamente.', 'OK');
                    this.loading = false;
                    return of(null);
                }),
                finalize(() => {
                    setTimeout(() => this.loading = false, 0);
                })
            )
            .subscribe(entry => {
                if (entry) {
                    const entryDate = new Date(entry.entryDate);
                    this.selectedDate = entryDate;

                    this.entryForm.patchValue({
                        entryDate: entryDate,
                        entryType: entry.entryType,
                        value: entry.value,
                        fkc: entry.fkc,
                        fkBank: entry.fkBank,
                        description: (entry as any).description || ''
                    });

                    this.currentYear = entryDate.getFullYear();
                    this.currentMonthIndex = entryDate.getMonth();
                    this.currentMonth = this.monthsLong[this.currentMonthIndex];
                    this.generateCalendarDays();
                }
                this.loading = false;
            });
    }

    loadCollaborators() {
        this.loadingCollaborators = true;
        this.collaboratorService.getCollaborators()
            .pipe(
                catchError(error => {
                    this.snackBar.open('Erro ao carregar colaboradores. Alguns dados podem estar incompletos.', 'OK');
                    this.loadingCollaborators = false;
                    return of([]);
                }),
                finalize(() => {
                    this.loadingCollaborators = false;
                    this.checkLoadingComplete();
                })
            )
            .subscribe(data => {
                this.collaborators = data || [];
            });
    }

    loadBanks() {
        this.loadingBanks = true;
        this.bankService.getBanks()
            .pipe(
                catchError(error => {
                    this.snackBar.open('Erro ao carregar bancos. Alguns dados podem estar incompletos.', 'OK');
                    this.loadingBanks = false;
                    return of([]);
                }),
                finalize(() => {
                    this.loadingBanks = false;
                    this.checkLoadingComplete();
                })
            )
            .subscribe(data => {
                this.banks = data || [];
            });
    }

    checkLoadingComplete() {
        if (!this.loadingCollaborators && !this.loadingBanks && !this.isEdit) {
            this.loading = false;
        }
    }

    onSubmit() {
        if (this.entryForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.submitLoading = true;
        const entryData = this.entryForm.value;

        if (this.isEdit && this.entryId) {
            this.entriesService.updateEntry(this.entryId, entryData)
                .pipe(
                    catchError(error => {
                        this.snackBar.open('Erro ao atualizar lançamento!', 'Fechar', { duration: 3000 });
                        this.submitLoading = false;
                        return of(null);
                    }),
                    finalize(() => {
                        setTimeout(() => this.submitLoading = false, 0);
                    })
                )
                .subscribe(result => {
                    if (result) {
                        this.router.navigate(['/entries']);
                        this.snackBar.open('Lançamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
                    }
                });
        } else {
            this.entriesService.createEntry(entryData)
                .pipe(
                    catchError(error => {
                        this.snackBar.open('Erro ao criar lançamento!', 'Fechar', { duration: 3000 });
                        this.submitLoading = false;
                        return of(null);
                    }),
                    finalize(() => {
                        setTimeout(() => this.submitLoading = false, 0);
                    })
                )
                .subscribe(result => {
                    if (result) {
                        this.router.navigate(['/entries']);
                        this.snackBar.open('Lançamento criado com sucesso!', 'Fechar', { duration: 3000 });
                    }
                });
        }
    }

    cancel(): void {
        this.router.navigate(['/entries']);
    }

    // ========== MÉTODOS DO CALENDÁRIO ==========

    initializeCalendar() {
        const today = new Date();
        this.currentYear = today.getFullYear();
        this.currentMonthIndex = today.getMonth();
        this.currentMonth = this.monthsLong[this.currentMonthIndex];

        const formDate = this.entryForm.get('entryDate')?.value;
        if (formDate && formDate instanceof Date) {
            this.selectedDate = formDate;
            this.currentYear = formDate.getFullYear();
            this.currentMonthIndex = formDate.getMonth();
            this.currentMonth = this.monthsLong[this.currentMonthIndex];
        }

        this.generateCalendarDays();
    }

    openCalendar(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        this.showCustomCalendar = true;

        const formDate = this.entryForm.get('entryDate')?.value;
        if (formDate && formDate instanceof Date) {
            this.selectedDate = formDate;
            this.currentYear = formDate.getFullYear();
            this.currentMonthIndex = formDate.getMonth();
            this.currentMonth = this.monthsLong[this.currentMonthIndex];
        }

        this.generateCalendarDays();
    }

    closeCalendar(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.showCustomCalendar = false;
    }

    previousMonth() {
        if (this.currentMonthIndex === 0) {
            this.currentMonthIndex = 11;
            this.currentYear--;
        } else {
            this.currentMonthIndex--;
        }
        this.currentMonth = this.monthsLong[this.currentMonthIndex];
        this.generateCalendarDays();
    }

    nextMonth() {
        if (this.currentMonthIndex === 11) {
            this.currentMonthIndex = 0;
            this.currentYear++;
        } else {
            this.currentMonthIndex++;
        }
        this.currentMonth = this.monthsLong[this.currentMonthIndex];
        this.generateCalendarDays();
    }

    generateCalendarDays() {
        const days: CalendarDay[] = [];
        const today = new Date();
        const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1);
        const lastDay = new Date(this.currentYear, this.currentMonthIndex + 1, 0);

        // Dias do mês anterior (se necessário para completar a primeira semana)
        const startPadding = firstDay.getDay(); // 0 = domingo, 1 = segunda, etc.
        for (let i = startPadding - 1; i >= 0; i--) {
            const prevDate = new Date(this.currentYear, this.currentMonthIndex, -i);
            days.push({
                date: prevDate.getDate(),
                fullDate: new Date(prevDate),
                currentMonth: false,
                isToday: false,
                isSelected: false
            });
        }

        // Dias do mês atual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(this.currentYear, this.currentMonthIndex, day);
            const isToday = this.isSameDate(currentDate, today);
            const isSelected = this.selectedDate ? this.isSameDate(currentDate, this.selectedDate) : false;

            days.push({
                date: day,
                fullDate: new Date(currentDate),
                currentMonth: true,
                isToday: isToday,
                isSelected: isSelected
            });
        }

        // Dias do próximo mês (se necessário para completar a última semana)
        // Só adiciona se não completou 6 semanas (42 dias) E se a última semana não está completa
        const totalDays = days.length;
        const remainingCells = 42 - totalDays;

        // Só adiciona dias do próximo mês se a última semana não estiver completa
        const daysInLastWeek = totalDays % 7;
        if (daysInLastWeek !== 0) {
            const daysToAdd = 7 - daysInLastWeek;
            for (let day = 1; day <= daysToAdd; day++) {
                const nextDate = new Date(this.currentYear, this.currentMonthIndex + 1, day);
                days.push({
                    date: day,
                    fullDate: new Date(nextDate),
                    currentMonth: false,
                    isToday: false,
                    isSelected: false
                });
            }
        }

        this.calendarDays = days;
    }

    selectDate(day: CalendarDay) {
        if (!day.currentMonth) {
            if (day.date > 15) {
                this.previousMonth();
            } else {
                this.nextMonth();
            }
            return;
        }

        this.selectedDate = day.fullDate;

        // Atualiza o formulário com a data selecionada
        this.entryForm.patchValue({
            entryDate: day.fullDate
        });

        // Força a atualização do valor formatado no input
        this.entryForm.get('entryDate')?.updateValueAndValidity();

        this.generateCalendarDays();
        this.updateInputDisplay();
        this.closeCalendar(new Event('click'));
    }

    isSameDate(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    formatDateBR(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private markFormGroupTouched() {
        Object.keys(this.entryForm.controls).forEach(key => {
            const control = this.entryForm.get(key);
            control?.markAsTouched();
        });
    }
    private updateInputDisplay() {
        setTimeout(() => {
            const inputElement = document.querySelector('input[formControlName="entryDate"]') as HTMLInputElement;
            if (inputElement && this.selectedDate) {
                inputElement.value = this.formatDateBR(this.selectedDate);
            }
        }, 0);
    }

    get formattedDate(): string {
        const date = this.entryForm.get('entryDate')?.value;
        if (date) {
            // Se for uma string, tenta converter para Date
            if (typeof date === 'string') {
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate.getTime())) {
                    return this.formatDateBR(parsedDate);
                }
                return date; // Retorna a string se não conseguir converter
            }
            // Se for um objeto Date
            if (date instanceof Date && !isNaN(date.getTime())) {
                return this.formatDateBR(date);
            }
        }
        return '';
    }

    trackByDate(index: number, day: CalendarDay): string {
        return `${day.fullDate.getTime()}-${day.currentMonth}`;
    }
}
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';
import { EntriesComponent } from './entries/entries.component';
import { EntryFormComponent } from './entry-form/entry-form.component';
import { CollaboratorsComponent } from './collaborators/collaborators.component';
import { CostCentersComponent } from './cost-centers/cost-centers.component';
import { RegionsComponent } from './regions/regions.component';
import { SectorsComponent } from './sectors/sectors.component';
import { BanksComponent } from './banks/banks.component';
import { ReportsComponent } from './reports/reports.component';
import { EntryModalComponent } from './entries/entry-modal/entry-modal.component';
import { CostCenterModalComponent } from '../app/cost-centers/cost-centers-modal/cost-center-modal.component';
import { RegionModalComponent } from './regions/region-modal/region-modal.component';
import { SectorModalComponent } from './sectors/sector-modal/sector-modal.component';
import { combineLatest } from 'rxjs';
import { BankModalComponent } from './banks/bank-modal/bank-modal.component';
import { RegisterComponent } from './components/register.component';




export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'entries', component: EntriesComponent },
    { path: 'entries/new', component: EntryFormComponent },
    { path: 'entries/:id', component: EntryFormComponent },
    { path: 'collaborators', component: CollaboratorsComponent },
    { path: 'banks', component: BanksComponent },
    // Removidas as rotas para o modal de colaborador
    { path: 'cost-centers', component: CostCentersComponent },
    { path: 'sectors', component: SectorsComponent },
    { path: 'regions', component: RegionsComponent },
    { path: 'regions', component: RegionsComponent },
    { path: 'sectors', component: SectorsComponent },
    { path: 'banks', component: BanksComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'cost-centers', component: CostCentersComponent },
    { path: '**', redirectTo: '/dashboard' }
];
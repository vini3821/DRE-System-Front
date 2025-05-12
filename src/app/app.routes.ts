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
import { SectorFormComponent } from './sector-form/sector-form.component';
import { BanksComponent } from './banks/banks.component';
import { ReportsComponent } from './reports/reports.component';
import { EntryModalComponent } from './entries/entry-modal/entry-modal.component';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'entries', component: EntriesComponent },
    { path: 'entries/new', component: EntryModalComponent },
    { path: 'entries/:id', component: EntryFormComponent },
    { path: 'collaborators', component: CollaboratorsComponent },
    { path: 'cost-centers', component: CostCentersComponent },
    { path: 'regions', component: RegionsComponent },
    { path: 'sectors', component: SectorsComponent },
    { path: 'sectors/new', component: SectorFormComponent },
    { path: 'sectors/:id', component: SectorFormComponent },
    { path: 'banks', component: BanksComponent },
    { path: 'reports', component: ReportsComponent },
    { path: '**', redirectTo: '/dashboard' }
];
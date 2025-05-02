import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Collaborator } from '../models/collaborator.model';


@Injectable({
    providedIn: 'root'
})
export class CollaboratorService {
    // Para desenvolvimento, use dados mockados
    private mockCollaborators: Collaborator[] = [
        {
            collaboratorID: 1,
            name: 'João Silva',
            fkcc: 1,
            costCenter: { description: 'Financeiro' }
        },
        {
            collaboratorID: 2,
            name: 'Maria Santos',
            fkcc: 2,
            costCenter: { description: 'Marketing' }
        }
    ];

    constructor(private http: HttpClient) { }

    getCollaborators(): Observable<Collaborator[]> {
        // Para desenvolvimento, retorne dados mockados
        return of(this.mockCollaborators);

        // Quando conectar à API real:
        // return this.http.get<Collaborator[]>(`${environment.apiUrl}/collaborators`);
    }
}
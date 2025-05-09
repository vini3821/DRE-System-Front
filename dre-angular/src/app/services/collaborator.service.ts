import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collaborator } from '../models/collaborator.model';
import { environment } from './environment';

@Injectable({
    providedIn: 'root'
})
export class CollaboratorService {
    private apiUrl = `${environment.apiUrl}/collaborators`;

    constructor(private http: HttpClient) { }

    getCollaborators(): Observable<Collaborator[]> {
        return this.http.get<Collaborator[]>(this.apiUrl);
    }

    getCollaborator(id: number): Observable<Collaborator> {
        return this.http.get<Collaborator>(`${this.apiUrl}/${id}`);
    }

    createCollaborator(collaborator: Collaborator): Observable<Collaborator> {
        return this.http.post<Collaborator>(this.apiUrl, collaborator);
    }

    updateCollaborator(id: number, collaborator: Collaborator): Observable<Collaborator> {
        return this.http.put<Collaborator>(`${this.apiUrl}/${id}`, collaborator);
    }

    deleteCollaborator(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
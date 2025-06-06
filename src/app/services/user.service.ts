import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models/user.model';
import { environment } from './environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    createUser(user: CreateUserRequest): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, user);
    }

    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    checkEmailExists(email: string): Observable<{ exists: boolean }> {
        return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email/${email}`);
    }

    checkUsernameExists(username: string): Observable<{ exists: boolean }> {
        return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-username/${username}`);
    }
}
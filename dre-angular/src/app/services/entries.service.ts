import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entry } from '../models/entry.model';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  private apiUrl = `${environment.apiUrl}/entries`;

  constructor(private http: HttpClient) { }

  getEntries(): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.apiUrl);
  }

  getEntry(id: number): Observable<Entry> {
    return this.http.get<Entry>(`${this.apiUrl}/${id}`);
  }

  createEntry(entry: Entry): Observable<Entry> {
    return this.http.post<Entry>(this.apiUrl, entry);
  }

  updateEntry(id: number, entry: Entry): Observable<Entry> {
    return this.http.put<Entry>(`${this.apiUrl}/${id}`, entry);
  }

  deleteEntry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
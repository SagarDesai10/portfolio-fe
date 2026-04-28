import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContactPayload } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  // private readonly API_URL = '/contact';

  // constructor(private http: HttpClient) {}

  sendMessage(payload: ContactPayload): Observable<{ success: boolean }> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.post<{ success: boolean }>(this.API_URL, payload);
    console.log('Contact form payload (mock):', payload);
    return of({ success: true }).pipe(delay(1200)); // simulate network latency
  }
}

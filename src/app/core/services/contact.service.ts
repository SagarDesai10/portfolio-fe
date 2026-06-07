import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContactPayload } from '../models/contact.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly base = `${environment.apiBaseUrl}/contact`;

  constructor(private http: HttpClient) {}

  sendMessage(payload: ContactPayload): Observable<{ success: boolean }> {
    return this.http.post<ResponseDTO<string>>(this.base, payload).pipe(
      map(() => ({ success: true }))
    );
  }
}

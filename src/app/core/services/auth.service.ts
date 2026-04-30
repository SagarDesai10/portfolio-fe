import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResponseDTO, TokenResponseDTO } from '../models/api-response.model';

const TOKEN_KEY    = 'portfolio_token';
const EXPIRY_KEY   = 'portfolio_token_expiry';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──────────────────────────────────────────────────

  login(username: string, password: string): Observable<TokenResponseDTO> {
    return this.http
      .post<ResponseDTO<TokenResponseDTO>>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        map((res) => res.data),
        tap((tokenData) => this.storeToken(tokenData)),
        catchError((err) => {
          const msg: string =
            err?.error?.responseDTO?.msg ??
            err?.error?.msg ??
            'Login failed. Please check your credentials.';
          return throwError(() => new Error(msg));
        }),
      );
  }

  // ── Token management ───────────────────────────────────────

  private storeToken(tokenData: TokenResponseDTO): void {
    const expiryMs = Date.now() + tokenData.expiresInSeconds * 1000;
    localStorage.setItem(TOKEN_KEY, tokenData.token);
    localStorage.setItem(EXPIRY_KEY, String(expiryMs));
  }

  getToken(): string | null {
    return this.isLoggedIn() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  isLoggedIn(): boolean {
    const token  = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!token || !expiry) return false;
    return Date.now() < Number(expiry);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    this.router.navigate(['/login']);
  }
}

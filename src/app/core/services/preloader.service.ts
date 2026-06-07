import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { catchError, map, take, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PreloaderService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  readonly isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  private readonly wakeUpUrl = `${environment.apiBaseUrl}/about`;

  constructor(private http: HttpClient) {
    this.checkServerStatus();
  }

  private checkServerStatus(): void {
    // If we already know the server is awake in this session, don't show preloader again.
    if (typeof window !== 'undefined' && sessionStorage.getItem('server_awake') === 'true') {
      this.loadingSubject.next(false);
      return;
    }

    // Ping the backend. Since the backend might be spinning up, we allow a long timeout (e.g., 60s).
    // If the server wakes up and responds, we proceed.
    // If it fails or times out, we still let the user in after 60s fallback so they aren't locked out.
    this.http.get(this.wakeUpUrl).pipe(
      timeout(60000), // 60 seconds timeout
      take(1),
      catchError((err) => {
        console.warn('Backend ping failed or timed out. Dismissing preloader fallback.', err);
        // We still set it to false so the user can see whatever static page compiles
        return [null];
      })
    ).subscribe({
      next: () => {
        this.markAsAwake();
      },
      error: () => {
        this.markAsAwake();
      }
    });
  }

  private markAsAwake(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('server_awake', 'true');
    }
    this.loadingSubject.next(false);
  }

  /** Forcefully dismiss the preloader (e.g., if user skips). */
  dismiss(): void {
    this.markAsAwake();
  }
}

import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = environment.gatewayNotify;
  private _notifications = signal<AppNotification[]>([]);

  readonly notifications = computed(() => this._notifications());
  readonly unreadCount = computed(() => this._notifications().filter(item => !item.read).length);

  constructor(private http: HttpClient) {}

  load(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.base}/me`).pipe(
      tap(notifications => this._notifications.set(notifications)),
      catchError(() => {
        this._notifications.set([]);
        return of([]);
      }),
    );
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.base}/${id}/read`, null).pipe(
      tap(updated => {
        this._notifications.update(list => list.map(item => item.id === updated.id ? updated : item));
      }),
    );
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/read-all`, null).pipe(
      tap(() => {
        this._notifications.update(list => list.map(item => ({ ...item, read: true })));
      }),
    );
  }
}

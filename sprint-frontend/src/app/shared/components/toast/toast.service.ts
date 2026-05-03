import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private _toasts: Toast[] = [];
  private subject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.subject.asObservable();

  show(message: string, type: Toast['type'] = 'info', duration = 3500): void {
    const id = ++this.counter;
    this._toasts = [...this._toasts, { id, message, type }];
    this.subject.next(this._toasts);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void   { this.show(message, 'error', 5000); }
  info(message: string): void    { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this._toasts = this._toasts.filter(t => t.id !== id);
    this.subject.next(this._toasts);
  }
}

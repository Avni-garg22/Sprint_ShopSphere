import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:w-96">
      @for (toast of toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 p-4 rounded-lg shadow-lg text-sm font-medium transition-all duration-300"
          [class]="toastClass(toast.type)"
        >
          <span class="text-lg leading-none">{{ toastIcon(toast.type) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            (click)="dismiss(toast.id)"
            class="text-current opacity-60 hover:opacity-100 leading-none text-base"
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent implements OnInit {
  toasts = signal<Toast[]>([]);

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(t => this.toasts.set(t));
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  toastClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-success-100 text-success-700 border border-green-200',
      error:   'bg-danger-100 text-danger-700 border border-red-200',
      info:    'bg-blue-50 text-blue-700 border border-blue-200',
      warning: 'bg-warning-100 text-warning-700 border border-yellow-200',
    };
    return map[type];
  }

  toastIcon(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: '✓', error: '✕', info: 'ℹ', warning: '⚠',
    };
    return map[type];
  }
}

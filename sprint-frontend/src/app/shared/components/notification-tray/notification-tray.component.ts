import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppNotification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-tray',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggle()"
        class="relative h-10 w-10 flex items-center justify-center rounded-lg transition-colors"
        [class.text-slate-200]="tone === 'dark'"
        [class.hover:bg-slate-900]="tone === 'dark'"
        [class.text-gray-600]="tone !== 'dark'"
        [class.hover:text-primary-600]="tone !== 'dark'"
        [class.hover:bg-gray-50]="tone !== 'dark'"
        aria-label="Notifications"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"/>
        </svg>
        @if (unreadCount() > 0) {
          <span class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      @if (open()) {
        <div
          class="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border shadow-xl z-50 overflow-hidden"
          [class.bg-white]="tone !== 'dark'"
          [class.border-gray-100]="tone !== 'dark'"
          [class.bg-slate-950]="tone === 'dark'"
          [class.border-slate-800]="tone === 'dark'"
        >
          <div
            class="h-12 px-4 flex items-center justify-between border-b"
            [class.border-gray-100]="tone !== 'dark'"
            [class.border-slate-800]="tone === 'dark'"
          >
            <span class="text-sm font-bold" [class.text-gray-900]="tone !== 'dark'" [class.text-white]="tone === 'dark'">
              Notifications
            </span>
            @if (unreadCount() > 0) {
              <button
                type="button"
                (click)="markAllRead()"
                class="text-xs font-semibold"
                [class.text-primary-600]="tone !== 'dark'"
                [class.text-amber-300]="tone === 'dark'"
              >
                Mark all
              </button>
            }
          </div>

          <div class="max-h-96 overflow-y-auto">
            @if (notifications().length === 0) {
              <div class="px-4 py-8 text-center text-sm" [class.text-gray-400]="tone !== 'dark'" [class.text-slate-500]="tone === 'dark'">
                No notifications
              </div>
            } @else {
              @for (notification of notifications(); track notification.id) {
                <a
                  [routerLink]="notificationLink(notification)"
                  (click)="markRead(notification)"
                  class="block px-4 py-3 border-b transition-colors"
                  [class.bg-primary-50]="tone !== 'dark' && !notification.read"
                  [class.hover:bg-gray-50]="tone !== 'dark'"
                  [class.border-gray-100]="tone !== 'dark'"
                  [class.bg-slate-900]="tone === 'dark' && !notification.read"
                  [class.hover:bg-slate-900]="tone === 'dark'"
                  [class.border-slate-800]="tone === 'dark'"
                >
                  <div class="flex items-start gap-3">
                    <span
                      class="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                      [class.bg-primary-600]="tone !== 'dark' && !notification.read"
                      [class.bg-gray-200]="tone !== 'dark' && notification.read"
                      [class.bg-amber-400]="tone === 'dark' && !notification.read"
                      [class.bg-slate-700]="tone === 'dark' && notification.read"
                    ></span>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-semibold leading-5" [class.text-gray-900]="tone !== 'dark'" [class.text-slate-100]="tone === 'dark'">
                        {{ notification.title }}
                      </p>
                      <p class="mt-1 text-sm leading-5" [class.text-gray-600]="tone !== 'dark'" [class.text-slate-400]="tone === 'dark'">
                        {{ notification.message }}
                      </p>
                      <p class="mt-2 text-xs" [class.text-gray-400]="tone !== 'dark'" [class.text-slate-500]="tone === 'dark'">
                        {{ timeLabel(notification.createdAt) }}
                      </p>
                    </div>
                  </div>
                </a>
              }
            }
          </div>
        </div>
      }
    </div>

    @if (open()) {
      <div class="fixed inset-0 z-40" (click)="open.set(false)"></div>
    }
  `,
})
export class NotificationTrayComponent implements OnInit, OnDestroy {
  @Input() tone: 'light' | 'dark' = 'light';

  open = signal(false);
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  private refreshId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.refresh();
    this.refreshId = setInterval(() => this.refresh(), 20000);
  }

  ngOnDestroy(): void {
    if (this.refreshId) {
      clearInterval(this.refreshId);
    }
  }

  toggle(): void {
    this.open.set(!this.open());
    if (this.open()) {
      this.refresh();
    }
  }

  refresh(): void {
    this.notificationService.load().subscribe();
  }

  markRead(notification: AppNotification): void {
    this.open.set(false);
    if (!notification.read) {
      this.notificationService.markRead(notification.id).subscribe();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe();
  }

  notificationLink(notification: AppNotification): Array<string | number> {
    if (notification.recipientType === 'ADMIN') {
      return ['/admin/orders'];
    }
    return notification.orderId ? ['/orders', notification.orderId] : ['/orders'];
  }

  timeLabel(value: string): string {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) {
      return '';
    }

    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

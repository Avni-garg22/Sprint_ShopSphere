import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="variantClass">
      {{ label }}
    </span>
  `,
})
export class BadgeComponent {
  @Input() label = '';
  @Input() variant: BadgeVariant = 'default';

  get variantClass(): string {
    const map: Record<BadgeVariant, string> = {
      success: 'bg-success-100 text-success-700',
      danger:  'bg-danger-100 text-danger-700',
      warning: 'bg-warning-100 text-warning-700',
      info:    'bg-blue-100 text-blue-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return map[this.variant];
  }
}

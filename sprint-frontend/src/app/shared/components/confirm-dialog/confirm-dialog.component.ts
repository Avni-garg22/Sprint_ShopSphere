import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ message }}</p>
          <div class="flex gap-3 justify-end">
            <button class="btn btn-secondary" (click)="cancel.emit()">Cancel</button>
            <button class="btn btn-danger" (click)="confirm.emit()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel  = new EventEmitter<void>();
}

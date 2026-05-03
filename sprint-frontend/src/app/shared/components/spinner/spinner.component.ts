import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (fullPage) {
      <div class="fixed inset-0 bg-white/70 backdrop-blur-sm z-40 flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          @if (message) {
            <p class="text-sm text-gray-500">{{ message }}</p>
          }
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    }
  `,
})
export class SpinnerComponent {
  @Input() fullPage = false;
  @Input() message = '';
}

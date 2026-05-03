import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardData } from '../../../core/services/admin.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

const REPORT_LABELS: Record<string, string> = {
  totalProducts: 'Total Products',
  totalOrders: 'Total Orders',
  totalRevenue: 'Total Revenue',
  pendingOrders: 'Pending Orders',
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, CurrencyFormatPipe],
  template: `
    <div class="page-container">
      <h1 class="section-title">Reports</h1>

      @if (loading()) {
        <app-spinner />
      } @else {
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Sales Report</h3>
          @if (report()) {
            <div class="space-y-3">
              @for (entry of reportEntries(); track entry.key) {
                <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span class="text-sm font-medium text-gray-600">{{ entry.label }}</span>
                  <span class="text-sm font-bold text-gray-900">
                    @if (entry.key === 'totalRevenue') {
                      {{ entry.value | currencyFormat }}
                    } @else {
                      {{ entry.value }}
                    }
                  </span>
                </div>
              }
            </div>
          } @else {
            <p class="text-gray-400 text-sm">No report data available.</p>
          }
        </div>
      }
    </div>
  `,
})
export class ReportsComponent implements OnInit {
  report  = signal<DashboardData | null>(null);
  loading = signal(true);

  reportEntries = () => {
    const r = this.report();
    if (!r) return [];
    return Object.entries(r).map(([key, value]) => ({
      key,
      label: REPORT_LABELS[key] ?? key,
      value: Number(value),
    }));
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getReports().subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

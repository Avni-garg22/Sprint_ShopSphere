import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderStatus', standalone: true })
export class OrderStatusPipe implements PipeTransform {
  transform(status: string | undefined): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      DRAFT: 'Draft',
      CHECKOUT: 'Checkout',
      PAID: 'Paid',
      PACKED: 'Packed',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      FAILED: 'Failed',
    };
    return status ? (map[status] ?? status) : '-';
  }
}

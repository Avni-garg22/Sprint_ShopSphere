export interface AppNotification {
  id: number;
  recipientType: 'USER' | 'ADMIN';
  recipientId?: number | null;
  title: string;
  message: string;
  type: string;
  orderId?: number | null;
  status?: string | null;
  read: boolean;
  createdAt: string;
}

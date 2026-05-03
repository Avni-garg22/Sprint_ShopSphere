export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  userId: number;
  status?: string;
  totalPrice?: number;
  customerName?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  deliveryMode?: string;
  paymentMode?: string;
  items: OrderItem[];
}

export interface OrderResponse {
  message: string;
  order: Order;
}

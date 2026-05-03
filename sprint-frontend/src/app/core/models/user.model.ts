export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CUSTOMER';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CUSTOMER';
}

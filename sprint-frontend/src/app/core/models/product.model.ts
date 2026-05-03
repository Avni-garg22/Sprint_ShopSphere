import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string | null;
  featured: boolean;
  category: Category | null;
}

export interface ProductRequest {
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string | null;
  featured: boolean;
  category: { id: number } | null;
}

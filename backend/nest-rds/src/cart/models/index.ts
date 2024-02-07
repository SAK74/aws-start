import { Cart_Status } from '@prisma/client';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type CartItem = {
  id: string;
  product: Product;
  count: number;
};

export type Cart = {
  user_id: string;
  created_at: Date;
  updated_at: Date;
  status: Cart_Status;
  items: CartItem[];
};

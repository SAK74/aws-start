import { CartItem } from "./CartItem";

export interface CartResponse {
  statusCode: number;
  message: string;
  data: {
    cart: Cart;
    total: number;
  };
}

 interface Cart {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  status: "OPEN" | "ORDERED";
  items: CartItem[];
}

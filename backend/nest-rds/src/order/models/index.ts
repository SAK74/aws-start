import { Order, Order_Status } from '@prisma/client';

// type Order = {
//   id: string;
//   userId: string;
//   cartId: string;
//   items: CartItem[];
//   payment: {
//     type: string;
//     address?: any;
//     creditCard?: any;
//   };
//   delivery: {
//     type: string;
//     address: any;
//   };
//   comments: string;
//   status: Order_Status;
//   total: number;
// };

export interface StoredOrder extends Order {
  items: {
    id: string;
    count: number;
    order_Id?: string;
    product_id: string;
  }[];
  history: {
    status: Order_Status;
    timestamp: Date;
    comment: string;
    order_id: string;
    id: string;
  }[];
}

export type OrderPayload = {
  items: {
    count: number;
    productId: string;
  }[];
  address: {
    address: string;
    comment: string;
    firstName: string;
    lastName: string;
  };
  statusHistory: {
    status: Order_Status;
    timestamp: number;
    comment: string;
  }[];
};

export type OrderResponse = OrderPayload & {
  id: string;
};

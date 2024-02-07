import { Product } from "../types";

export const products: Omit<Product, "count">[] = [
  {
    description: "Short Product Description1",
    price: 24,
    title: "ProductOne",
  },
  {
    description: "Short Product Description7",
    price: 15,
    title: "ProductTitle",
  },
  {
    description: "Short Product Description2",
    price: 23,
    title: "Product",
  },
];

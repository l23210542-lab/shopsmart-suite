import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "./catalog-types";
import { findStaticProduct } from "./catalog-static";

export type CartItem = { productId: string; quantity: number };
export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  address: string;
  status: "pendiente" | "pagada" | "enviada" | "entregada";
};

type Ctx = {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  update: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  orders: Order[];
  placeOrder: (address: string) => Order;
};

const CartCtx = createContext<Ctx | null>(null);

const KEY_CART = "picommerce.cart";
const KEY_ORDERS = "picommerce.orders";

export function CartProvider({
  children,
  resolveProduct,
}: {
  children: ReactNode;
  /** Si se omite, se usan solo los productos del mock estático. */
  resolveProduct?: (id: string) => Product | undefined;
}) {
  const findProduct = resolveProduct ?? findStaticProduct;
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const c = localStorage.getItem(KEY_CART);
      const o = localStorage.getItem(KEY_ORDERS);
      if (c) setItems(JSON.parse(c));
      if (o) setOrders(JSON.parse(o));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY_CART, JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  const add: Ctx["add"] = (productId, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      const product = findProduct(productId);
      const max = product?.stock ?? 99;
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(max, i.quantity + qty) } : i,
        );
      }
      return [...prev, { productId, quantity: Math.min(max, qty) }];
    });
  };

  const update: Ctx["update"] = (productId, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const remove: Ctx["remove"] = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const clear = () => setItems([]);

  const subtotal = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  const placeOrder: Ctx["placeOrder"] = (address) => {
    const order: Order = {
      id: `O-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items,
      total: subtotal,
      address,
      status: "pagada",
    };
    setOrders((prev) => [order, ...prev]);
    setItems([]);
    return order;
  };

  return (
    <CartCtx.Provider
      value={{ items, add, update, remove, clear, subtotal, count, orders, placeOrder }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

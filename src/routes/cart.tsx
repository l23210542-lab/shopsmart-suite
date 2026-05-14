import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: Cart });

function Cart() {
  const { items, update, remove, subtotal } = useCart();
  const { findProduct } = useAppCatalog();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">
          Explora el catálogo y añade tus primeros productos.
        </p>
        <Link to="/products" search={{} as any}>
          <Button className="mt-6 rounded-full bg-primary text-primary-foreground">
            Ver productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-4">
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl border bg-card p-4 shadow-card sm:p-6">
          <h1 className="mb-2 text-3xl font-bold">Carrito de compras</h1>
          <p className="mb-4 text-sm text-muted-foreground">Los precios incluyen IGV.</p>
          <div className="divide-y">
            {items.map((item) => {
              const p = findProduct(item.productId);
              if (!p) return null;
              return (
                <div key={item.productId} className="flex gap-4 py-4">
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="size-28 shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    <img src={p.image} alt={p.name} className="size-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="font-semibold hover:text-price"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Vendido por {p.seller}</p>
                    <p className="text-xs text-success">En stock</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border">
                        <button
                          onClick={() => update(p.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-accent"
                          aria-label="Disminuir"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => update(p.id, Math.min(p.stock, item.quantity + 1))}
                          className="px-2 py-1 hover:bg-accent"
                          aria-label="Aumentar"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(p.id)}
                        className="flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2 className="size-3" /> Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      S/ {(p.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">S/ {p.price.toFixed(2)} c/u</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-right text-lg">
            Subtotal: <span className="font-bold">S/ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        <aside className="h-fit rounded-xl border bg-card p-5 shadow-card md:sticky md:top-32">
          <p className="text-sm text-success">✓ Tu pedido califica para envío GRATIS</p>
          <div className="mt-3 text-2xl font-bold">Total: S/ {subtotal.toFixed(2)}</div>
          <Link to="/checkout">
            <Button className="mt-3 w-full rounded-full bg-primary text-primary-foreground hover:brightness-95">
              Proceder al pago
            </Button>
          </Link>
          <Link to="/products" search={{} as any}>
            <Button variant="ghost" className="mt-2 w-full">
              Seguir comprando
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}

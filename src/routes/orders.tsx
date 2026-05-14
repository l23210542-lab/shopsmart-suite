import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { getDeliveryEstimate } from "@/lib/delivery-estimate";
import { Package, CheckCircle2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orders")({ component: Orders });

function Orders() {
  const { orders } = useCart();
  const { findProduct } = useAppCatalog();

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Aún no tienes órdenes</h1>
        <p className="mt-2 text-muted-foreground">Cuando hagas una compra aparecerá aquí.</p>
        <Link to="/products" search={{} as any}>
          <Button className="mt-6 rounded-full bg-primary text-primary-foreground">
            Comprar ahora
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 sm:px-4">
      <h1 className="mb-6 text-3xl font-bold">Mis órdenes</h1>
      <div className="space-y-4">
        {orders.map((o) => {
          const delivery = getDeliveryEstimate(o);
          return (
          <div key={o.id} className="overflow-hidden rounded-xl border bg-card shadow-card">
            <div className="flex flex-wrap items-center gap-6 border-b bg-muted px-5 py-3 text-xs">
              <div>
                <div className="text-muted-foreground">Pedido</div>
                <div className="font-semibold">{o.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Fecha</div>
                <div className="font-semibold">{new Date(o.date).toLocaleString("es-PE")}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-semibold">$ {o.total.toFixed(2)}</div>
                {typeof o.subtotal === "number" && typeof o.shipping === "number" && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Subtotal $ {o.subtotal.toFixed(2)} · Envío {o.shipping === 0 ? "gratis" : `$ ${o.shipping.toFixed(2)}`}
                  </div>
                )}
              </div>
              <div className="min-w-[200px] max-w-md flex-1">
                <div className="text-muted-foreground">Enviar a</div>
                <div className="line-clamp-3 font-semibold whitespace-pre-wrap">{o.address}</div>
              </div>
              <div className="ml-auto flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 font-semibold text-success">
                <CheckCircle2 className="size-3.5" /> {o.status.toUpperCase()}
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-3 border-b border-dashed bg-primary/5 px-5 py-3 text-sm">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Truck className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">Entrega estimada</div>
                <p className="mt-0.5 text-muted-foreground">
                  Llegada prevista <span className="font-medium text-foreground">{delivery.rangeLabel}</span>
                  <span className="text-xs"> · {delivery.leadTimeLabel}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tipo: {delivery.tierLabel}. Fechas orientativas en días hábiles (no festivos); el transportista puede confirmar el día exacto.
                </p>
              </div>
            </div>
            <div className="divide-y p-5">
              {o.items.map((it) => {
                const p = findProduct(it.productId);
                if (!p) return null;
                return (
                  <div key={it.productId} className="flex items-center gap-4 py-3">
                    <img src={p.image} alt={p.name} className="size-16 rounded object-cover" />
                    <div className="flex-1">
                      <Link
                        to="/product/$id"
                        params={{ id: p.id }}
                        className="font-semibold hover:text-price"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">Cantidad: {it.quantity}</div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Comprar de nuevo
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

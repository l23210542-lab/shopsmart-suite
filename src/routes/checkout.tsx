import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { findProduct } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, MapPin, Package } from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { items, subtotal, placeOrder } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState("Av. Larco 123, Miraflores, Lima");
  const [name, setName] = useState(user?.name ?? "");
  const [card, setCard] = useState("4242 4242 4242 4242");

  const shipping = subtotal > 100 ? 0 : 9.9;
  const total = subtotal + shipping;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Tu carrito está vacío");
    const order = placeOrder(address);
    toast.success(`Orden ${order.id} creada`);
    nav({ to: "/orders" });
  };

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 sm:px-4">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card title="1. Dirección de envío" icon={<MapPin className="size-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Teléfono" defaultValue="+51 999 888 777" required />
            </div>
            <Input className="mt-3" placeholder="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </Card>

          <Card title="2. Método de pago" icon={<CreditCard className="size-5" />}>
            <Input placeholder="Número de tarjeta" value={card} onChange={(e) => setCard(e.target.value)} required />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Input placeholder="MM/AA" defaultValue="12/28" />
              <Input placeholder="CVV" defaultValue="123" />
              <Input placeholder="Postal" defaultValue="15001" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Demo: no se procesa pago real.</p>
          </Card>

          <Card title="3. Revisar artículos" icon={<Package className="size-5" />}>
            {items.length === 0 && <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>}
            <ul className="divide-y">
              {items.map((i) => {
                const p = findProduct(i.productId);
                if (!p) return null;
                return (
                  <li key={i.productId} className="flex items-center gap-3 py-3">
                    <img src={p.image} alt={p.name} className="size-14 rounded object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Cant. {i.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold">S/ {(p.price * i.quantity).toFixed(2)}</div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <aside className="h-fit rounded-xl border bg-card p-5 shadow-card md:sticky md:top-32">
          <h3 className="mb-3 text-lg font-bold">Resumen</h3>
          <Row label="Subtotal" value={`S/ ${subtotal.toFixed(2)}`} />
          <Row label="Envío" value={shipping === 0 ? "GRATIS" : `S/ ${shipping.toFixed(2)}`} />
          <div className="my-3 border-t" />
          <Row label="Total" value={`S/ ${total.toFixed(2)}`} bold />
          <Button type="submit" className="mt-4 w-full rounded-full bg-primary text-primary-foreground hover:brightness-95">
            Confirmar pedido
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Al confirmar aceptas los términos de Cenít Pi.</p>
        </aside>
      </form>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">{icon} {title}</h2>
      {children}
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "text-base font-bold" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

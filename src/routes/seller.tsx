import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { Button } from "@/components/ui/button";
import { Plus, Package, DollarSign, ShoppingBag, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/seller")({ component: Seller });

function Seller() {
  const { user } = useAuth();
  const { orders } = useCart();
  const { products, categories, findProduct } = useAppCatalog();

  // Mock: every product whose id ends in odd number "belongs" to this seller
  const myProducts = products.slice(0, 10);
  const sales = orders
    .flatMap((o) => o.items)
    .reduce((s, i) => {
      const p = findProduct(i.productId);
      return s + (p ? p.price * i.quantity : 0);
    }, 0);

  if (!user || user.role === "customer") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Acceso de vendedor requerido</h1>
        <p className="mt-2 text-muted-foreground">Inicia sesión como vendedor para ver tu panel.</p>
        <Link to="/login">
          <Button className="mt-4 rounded-full bg-primary text-primary-foreground">
            Iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-4">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Panel del vendedor</h1>
          <p className="text-sm text-muted-foreground">
            Hola, {user.name}. Aquí puedes gestionar tu catálogo.
          </p>
        </div>
        <Button className="rounded-full bg-primary text-primary-foreground">
          <Plus className="mr-1 size-4" /> Publicar producto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Package />}
          label="Productos publicados"
          value={myProducts.length.toString()}
        />
        <Stat icon={<ShoppingBag />} label="Órdenes recibidas" value={orders.length.toString()} />
        <Stat icon={<DollarSign />} label="Ventas totales" value={`$ ${sales.toFixed(2)}`} />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-lg font-bold">Mis productos</h2>
          <span className="text-sm text-muted-foreground">{myProducts.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myProducts.map((p) => (
                <tr key={p.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="size-10 rounded object-cover hidden md:block" />
                      <Link
                        to="/product/$id"
                        params={{ id: p.id }}
                        className="font-medium hover:text-price"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {categories.find((c) => c.slug === p.category)?.name}
                  </td>
                  <td className="px-4 py-3 font-semibold">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${p.stock < 5 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-price">
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

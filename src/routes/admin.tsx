import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, Package, Tags, Activity } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user } = useAuth();
  const { orders } = useCart();
  const { products, categories } = useAppCatalog();

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">
          Inicia sesi├│n como administrador para acceder al panel.
        </p>
        <Link to="/login">
          <Button className="mt-4 rounded-full bg-primary text-primary-foreground">
            Iniciar sesi├│n
          </Button>
        </Link>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-3 py-6 sm:px-4 md:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-xl border bg-card p-4 shadow-card md:sticky md:top-32">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Admin
        </h3>
        <nav className="space-y-1 text-sm">
          {[
            { label: "Dashboard", icon: Activity },
            { label: "Usuarios", icon: Users },
            { label: "Productos", icon: Package },
            { label: "Categor├¡as", icon: Tags },
            { label: "├ôrdenes", icon: ShoppingBag },
          ].map((it, i) => (
            <button
              key={it.label}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-accent ${i === 0 ? "bg-accent font-semibold" : ""}`}
            >
              <it.icon className="size-4" /> {it.label}
            </button>
          ))}
        </nav>
      </aside>

      <section>
        <h1 className="mb-1 text-3xl font-bold">Panel administrativo</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Visi├│n general del marketplace Cen├¡t Pi.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Package />} label="Productos" value={products.length.toString()} />
          <Stat icon={<Tags />} label="Categor├¡as" value={categories.length.toString()} />
          <Stat icon={<ShoppingBag />} label="├ôrdenes" value={orders.length.toString()} />
          <Stat icon={<Users />} label="Ingresos" value={`S/ ${totalRevenue.toFixed(2)}`} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="├ôrdenes recientes">
            {orders.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No hay ├│rdenes todav├¡a.</p>
            ) : (
              <ul className="divide-y">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-semibold">{o.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(o.date).toLocaleString("es-PE")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">S/ {o.total.toFixed(2)}</div>
                      <div className="text-xs text-success uppercase">{o.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Categor├¡as destacadas">
            <ul className="divide-y">
              {categories.map((c) => (
                <li key={c.slug} className="flex items-center justify-between p-4">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {products.filter((p) => p.category === c.slug).length} productos
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="border-b px-5 py-3 font-bold">{title}</div>
      {children}
    </div>
  );
}

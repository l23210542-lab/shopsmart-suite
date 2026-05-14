import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findProductInBundle } from "@/lib/catalog-helpers";
import { getProductByIdFromDb } from "@/backend/catalog.server";
import { Star, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { useAppCatalog } from "@/lib/use-app-catalog";

export const Route = createFileRoute("/product/$id")({
  component: Detail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl p-12 text-center">
      <h1 className="text-2xl font-bold">Producto no encontrado</h1>
      <Link to="/products" search={{} as any} className="mt-4 inline-block text-price underline">
        Volver al catálogo
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
  loader: async ({ context, params }) => {
    let product = findProductInBundle(context.catalog, params.id);
    if (!product) {
      const fromDb = await getProductByIdFromDb({ data: { id: params.id } });
      if (fromDb) product = fromDb;
    }
    if (!product) throw notFound();
    return { product };
  },
});

function Detail() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const { products } = useAppCatalog();
  const [qty, setQty] = useState(1);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-4">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Inicio
        </Link>{" "}
        ·{" "}
        <Link
          to="/products"
          search={{ cat: product.category, q: undefined } as any}
          className="hover:underline"
        >
          {product.category}
        </Link>{" "}
        · <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-6 rounded-xl border bg-card p-4 shadow-card md:grid-cols-[1fr_1.2fr_320px] md:p-6">
        <div className="overflow-hidden rounded-lg bg-muted">
          <img src={product.image} alt={product.name} className="size-full object-cover" />
        </div>

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <Link
            to="/products"
            search={{} as any}
            className="mt-1 inline-block text-sm text-price hover:underline"
          >
            por {product.seller}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < Math.round(product.rating) ? "fill-rating text-rating" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <span className="text-sm text-price hover:underline">{product.reviews} reseñas</span>
          </div>
          <div className="my-4 border-y py-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl text-price">$</span>
              <span className="text-4xl font-bold">{product.price.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Precio incluye IGV. Envío calculado en checkout.
            </p>
          </div>
          <h3 className="mb-2 font-semibold">Sobre este producto</h3>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-success" /> Stock disponible: {product.stock} unidades
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-success" /> Vendido y enviado por {product.seller}
            </li>
          </ul>
        </div>

        {/* Buy box */}
        <aside className="h-fit rounded-lg border bg-background p-4">
          <div className="text-2xl font-bold">$ {product.price.toFixed(2)}</div>
          <p className="mt-1 flex items-center gap-1 text-sm text-success">
            <Truck className="size-4" /> Envío GRATIS mañana
          </p>
          <p className="mt-2 text-sm">
            {product.stock > 5
              ? "En stock"
              : product.stock > 0
                ? `Solo quedan ${product.stock}!`
                : "Agotado"}
          </p>

          <label className="mt-3 block text-sm">
            Cantidad:
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="ml-2 rounded-md border bg-card px-2 py-1"
            >
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <div className="mt-3 space-y-2">
            <Button
              className="w-full rounded-full bg-primary text-primary-foreground hover:brightness-95"
              onClick={() => {
                add(product.id, qty);
                toast.success("Añadido al carrito");
              }}
            >
              Añadir al carrito
            </Button>
            <Link to="/cart">
              <Button variant="secondary" className="w-full rounded-full">
                Ir al carrito
              </Button>
            </Link>
          </div>

          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-3.5" /> Compra protegida
            </p>
            <p className="flex items-center gap-2">
              <RotateCcw className="size-3.5" /> Devolución gratuita 30 días
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-2xl font-bold">Productos relacionados</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

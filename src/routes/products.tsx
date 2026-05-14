import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { ProductCard } from "@/components/ProductCard";

const productSearchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  sort: z.enum(["relevant", "price-asc", "price-desc", "rating"]).optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: productSearchSchema,
  component: Products,
});

function Products() {
  const { categories, products } = useAppCatalog();
  const { q, cat, sort = "relevant" } = Route.useSearch();

  let items = products;
  if (cat) items = items.filter((p) => p.category === cat);
  if (q) {
    const t = q.toLowerCase();
    items = items.filter(
      (p) => p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t),
    );
  }
  if (sort === "price-asc") items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") items = [...items].sort((a, b) => b.price - a.price);
  if (sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating);

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-4">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-xl border bg-card p-4 shadow-card md:sticky md:top-32 md:self-start">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Categorías
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                to="/products"
                search={{ cat: undefined, q, sort } as any}
                className={`block rounded px-2 py-1 hover:bg-accent ${!cat ? "bg-accent font-semibold" : ""}`}
              >
                Todas
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/products"
                  search={{ cat: c.slug, q, sort } as any}
                  className={`block rounded px-2 py-1 hover:bg-accent ${cat === c.slug ? "bg-accent font-semibold" : ""}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">
                {q
                  ? `Resultados para "${q}"`
                  : cat
                    ? categories.find((c) => c.slug === cat)?.name
                    : "Todos los productos"}
              </h1>
              <p className="text-sm text-muted-foreground">{items.length} productos encontrados</p>
            </div>
            <select
              value={sort}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", e.target.value);
                window.location.href = url.pathname + "?" + url.searchParams.toString();
              }}
              className="rounded-md border bg-card px-3 py-1.5 text-sm"
            >
              <option value="relevant">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="rating">Mejor valorados</option>
            </select>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

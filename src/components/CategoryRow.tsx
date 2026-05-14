import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/catalog-types";

export function CategoryRow({
  title,
  slug,
  items,
}: {
  title: string;
  slug: string;
  items: Product[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const step = Math.max(240, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-2 border-b pb-2">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <Link to="/products" search={{ cat: slug, q: undefined } as any} className="text-sm font-medium text-price hover:underline">
          Ver todo →
        </Link>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card p-1 shadow-pop hover:bg-accent sm:left-1 sm:size-9 sm:p-2 md:-left-3 md:size-10 md:p-2"
          aria-label="Anterior"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </button>
        <div ref={ref} className="flex gap-3 overflow-x-auto px-8 pb-2 scrollbar-hide sm:px-10 md:px-0">
          {items.map((p) => (
            <div key={p.id} className="w-[200px] shrink-0 sm:w-[220px]">
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card p-1 shadow-pop hover:bg-accent sm:right-1 sm:size-9 sm:p-2 md:-right-3 md:size-10 md:p-2"
          aria-label="Siguiente"
        >
          <ChevronRight className="size-4 sm:size-5" />
        </button>
      </div>
    </section>
  );
}

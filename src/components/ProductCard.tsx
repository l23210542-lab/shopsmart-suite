import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Product } from "@/lib/catalog-types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition hover:shadow-pop ${compact ? "min-w-[180px]" : ""}`}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-sm font-medium leading-tight hover:text-price"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3 ${i < Math.round(product.rating) ? "fill-rating text-rating" : "text-muted"}`}
              />
            ))}
          </div>
          <span>({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-price">$</span>
          <span className="text-xl font-bold text-foreground">{product.price.toFixed(2)}</span>
        </div>
        {!compact && (
          <Button
            size="sm"
            className="mt-auto rounded-full bg-primary text-primary-foreground hover:brightness-95"
            onClick={() => {
              add(product.id);
              toast.success("Añadido al carrito", { description: product.name });
            }}
          >
            Añadir al carrito
          </Button>
        )}
      </div>
    </div>
  );
}

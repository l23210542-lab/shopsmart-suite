import type { AppCatalogBundle, Product } from "./catalog-types";

export function findProductInBundle(bundle: AppCatalogBundle, id: string): Product | undefined {
  return bundle.products.find((p) => p.id === id);
}

export function productsByCategoryInBundle(bundle: AppCatalogBundle, slug: string): Product[] {
  return bundle.products.filter((p) => p.category === slug);
}

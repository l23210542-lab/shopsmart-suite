import { useRouteContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { AppCatalogBundle, Product } from "@/lib/catalog-types";
import { findProductInBundle, productsByCategoryInBundle } from "@/lib/catalog-helpers";

export interface AppCatalogContext extends AppCatalogBundle {
  findProduct: (id: string) => Product | undefined;
  productsByCategory: (slug: string) => Product[];
}

export function useAppCatalog(): AppCatalogContext {
  const { catalog } = useRouteContext({ from: "__root__" }) as {
    queryClient: QueryClient;
    catalog: AppCatalogBundle;
  };
  return {
    ...catalog,
    findProduct: (id: string) => findProductInBundle(catalog, id),
    productsByCategory: (slug: string) => productsByCategoryInBundle(catalog, slug),
  };
}

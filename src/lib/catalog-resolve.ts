import { getCatalogFromDb } from "@/backend/catalog.server";
import type { AppCatalogBundle } from "@/lib/catalog-types";
import { STATIC_CATEGORIES, STATIC_PRODUCTS } from "@/lib/catalog-static";

/**
 * Resuelve el catálogo para `beforeLoad` de la ruta raíz:
 * intenta MariaDB; si no hay configuración, error o tablas vacías, usa el mock estático.
 */
export async function resolveCatalogForApp(): Promise<AppCatalogBundle> {
  try {
    const live = await getCatalogFromDb();
    if (live && live.products.length > 0 && live.categories.length > 0) {
      return {
        products: live.products,
        categories: live.categories,
        source: "mariadb",
      };
    }
  } catch (e) {
    console.warn("[cenit-pi] Catálogo MariaDB no disponible; usando datos estáticos.", e);
  }

  return {
    products: STATIC_PRODUCTS,
    categories: STATIC_CATEGORIES,
    source: "static",
  };
}

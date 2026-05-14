import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isDatabaseConfigured } from "@/backend/db/env";
import {
  fetchCategoriesFromDb,
  fetchProductByIdFromDb,
  fetchProductsFromDb,
  pingDatabase,
} from "@/backend/db/catalog-repository";
import type { AppCatalogBundle, Product } from "@/lib/catalog-types";

export type CatalogFromDbPayload = Pick<AppCatalogBundle, "products" | "categories"> & {
  source: "mariadb";
};

/** Catálogo completo desde MariaDB (solo servidor). Devuelve null si no hay BD o está vacía. */
export const getCatalogFromDb = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogFromDbPayload | null> => {
    if (!isDatabaseConfigured()) return null;

    const [categories, products] = await Promise.all([
      fetchCategoriesFromDb(),
      fetchProductsFromDb(),
    ]);
    if (!categories?.length || !products?.length) return null;

    return { products, categories, source: "mariadb" };
  },
);

/** Un producto por id (útil si el catálogo en memoria aún no está cargado). */
export const getProductByIdFromDb = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ id: z.string().min(1) }).parse(raw))
  .handler(async ({ data }): Promise<Product | null> => {
    if (!isDatabaseConfigured()) return null;
    return fetchProductByIdFromDb(data.id);
  });

/** Comprobación de conectividad (panel admin / healthchecks). */
export const pingMariaDb = createServerFn({ method: "GET" }).handler(async () => {
  return pingDatabase();
});

/**
 * Punto único de exportación del dominio "catálogo".
 * Los datos en runtime vienen del contexto de la ruta raíz (MariaDB o estático).
 */
export type { AppCatalogBundle, Category, Product } from "./catalog-types";
export { findProductInBundle, productsByCategoryInBundle } from "./catalog-helpers";
export {
  STATIC_CATEGORIES,
  STATIC_PRODUCTS,
  findStaticProduct,
  productsByCategorySlugStatic,
} from "./catalog-static";

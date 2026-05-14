/**
 * Punto ├║nico de exportaci├│n del dominio "cat├ílogo".
 * Los datos en runtime vienen del contexto de la ruta ra├¡z (MariaDB o est├ítico).
 */
export type { AppCatalogBundle, Category, Product } from "./catalog-types";
export { findProductInBundle, productsByCategoryInBundle } from "./catalog-helpers";
export {
  STATIC_CATEGORIES,
  STATIC_PRODUCTS,
  findStaticProduct,
  productsByCategorySlugStatic,
} from "./catalog-static";

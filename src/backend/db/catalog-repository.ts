import type { RowDataPacket } from "mysql2";
import type { Category, Product } from "@/lib/catalog-types";
import { getDbPool } from "./pool";

interface CategoryRow extends RowDataPacket {
  name: string;
  slug: string;
}

interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image: string;
  category: string;
  seller: string;
  rating: string | number;
  reviews: number;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: typeof row.price === "string" ? Number.parseFloat(row.price) : row.price,
    stock: row.stock,
    image: row.image,
    category: row.category,
    seller: row.seller,
    rating: typeof row.rating === "string" ? Number.parseFloat(row.rating) : row.rating,
    reviews: row.reviews,
  };
}

export async function fetchCategoriesFromDb(): Promise<Category[] | null> {
  const pool = await getDbPool();
  if (!pool) return null;

  const [rows] = await pool.query<CategoryRow[]>(
    "SELECT name, slug FROM categories ORDER BY name ASC",
  );
  return rows.map((r) => ({ name: r.name, slug: r.slug }));
}

export async function fetchProductsFromDb(): Promise<Product[] | null> {
  const pool = await getDbPool();
  if (!pool) return null;

  const [rows] = await pool.query<ProductRow[]>(
    `SELECT p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image,
            c.slug AS category,
            p.seller_name AS seller,
            p.rating,
            p.reviews
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       ORDER BY p.name ASC`,
  );
  return rows.map(mapProduct);
}

export async function fetchProductByIdFromDb(id: string): Promise<Product | null> {
  const pool = await getDbPool();
  if (!pool) return null;

  const [rows] = await pool.query<ProductRow[]>(
    `SELECT p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image,
            c.slug AS category,
            p.seller_name AS seller,
            p.rating,
            p.reviews
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
      WHERE p.id = :id
      LIMIT 1`,
    { id },
  );
  const row = rows[0];
  return row ? mapProduct(row) : null;
}

export async function pingDatabase(): Promise<{ ok: boolean; message: string }> {
  const pool = await getDbPool();
  if (!pool) {
    return { ok: false, message: "MariaDB no configurada (faltan variables de entorno o mysql2)." };
  }
  try {
    await pool.query("SELECT 1 AS ok");
    return { ok: true, message: "Conexión a MariaDB correcta." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `Error de conexión: ${msg}` };
  }
}

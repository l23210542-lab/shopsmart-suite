import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const categories = [
  { slug: "electronica", name: "Electrónica" },
  { slug: "hogar", name: "Hogar y Cocina" },
  { slug: "supermercado", name: "Supermercado" },
  { slug: "moda", name: "Moda" },
  { slug: "deportes", name: "Deportes" },
  { slug: "libros", name: "Libros" },
];
const photos = [
  "1505740420928-5e560c06d30e",
  "1572569511254-d8f925fe2cbb",
  "1571171637578-41bc2dd41cd2",
  "1542838132-92c53300491e",
  "1606813907291-d86efa9b94db",
  "1546868871-7041f2a55e12",
  "1593642632559-0c6d3fc62b89",
  "1526170375885-4d8ecf77b99f",
  "1542291026-7eec264c27ff",
  "1585386959984-a4155224a1ad",
  "1523275335684-37898b6baf30",
  "1558618666-fcd25c85cd64",
  "1550009158-9ebf69173e03",
  "1583394838336-acd977736f90",
  "1574629810360-7efbbe195018",
  "1542367597-8849eb950fd8",
  "1481627834876-b7833e8f5570",
  "1512820790803-83ca734da794",
];
const seller = ["TechBay", "Casa Andina", "Mercado Express", "ModaPlus", "DeportesPro", "LibroMundo"];
const names = {
  electronica: ["Auriculares Bluetooth", "Raspberry Pi 4 Kit", "Smartwatch Sport", "Laptop UltraSlim", "Cámara Mirrorless", "Parlante Portátil"],
  hogar: ["Refrigeradora 200L", "Silla Ergonómica", "Cafetera Espresso", "Lámpara LED", "Set de Sartenes", "Aspiradora Robot"],
  supermercado: ["Banano Orgánico (1kg)", "Café Premium 500g", "Aceite de Oliva 1L", "Pasta Italiana", "Quinua Andina 1kg", "Chocolate 70%"],
  moda: ["Zapatillas Runner", "Hoodie Oversize", "Reloj Clásico", "Mochila Urbana", "Lentes de Sol", "Camisa Lino"],
  deportes: ["Balón Profesional", "Mancuernas 10kg", "Bicicleta MTB", "Yoga Mat Premium", "Botella Térmica", "Guantes Gym"],
  libros: ["Sapiens", "Clean Code", "El Principito", "Atomic Habits", "Cien Años de Soledad", "The Pragmatic Programmer"],
};

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

const rows = [];
for (let i = 0; i < 36; i++) {
  const cat = categories[i % 6];
  const photo = photos[i % photos.length];
  const name = names[cat.slug][Math.floor(i / 6) % 6];
  const id = `p-${i + 1}`;
  const desc = `${name} de alta calidad, vendido por ${seller[i % 6]}. Envío rápido desde nuestro depósito local. Garantía de 12 meses y devolución gratuita en 30 días.`;
  const price = Math.round((9 + ((i * 7) % 480)) * 100) / 100;
  const stock = 3 + ((i * 5) % 40);
  const image = `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=600&q=70`;
  const rating = 3.5 + (i % 4) * 0.4;
  const reviews = 12 + ((i * 17) % 800);
  rows.push(
    `('${esc(id)}','${esc(name)}','${esc(desc)}',${price},${stock},'${esc(image)}','${cat.slug}','${esc(seller[i % 6])}',${rating.toFixed(1)},${reviews})`,
  );
}

const sql =
  "USE shopsmart;\nSET NAMES utf8mb4;\n\n" +
  "INSERT INTO products (id, name, description, price, stock, image_url, category_slug, seller_name, rating, review_count) VALUES\n" +
  rows.join(",\n") +
  ";\n";

writeFileSync(join(__dirname, "seed-products-generated.sql"), sql, "utf8");


//LOS PUMAS VAN A GANAR LA LIGUILLA, 4:17 AM, ESTOY SIN ENERGIA


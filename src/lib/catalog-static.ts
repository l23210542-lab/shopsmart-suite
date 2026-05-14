import type { Category, Product } from "./catalog-types";

export const STATIC_CATEGORIES: Category[] = [
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

const seller = [
  "TechBay",
  "Casa Andina",
  "Mercado Express",
  "ModaPlus",
  "DeportesPro",
  "LibroMundo",
];

export const STATIC_PRODUCTS: Product[] = Array.from({ length: 36 }, (_, i) => {
  const cat = STATIC_CATEGORIES[i % STATIC_CATEGORIES.length];
  const photo = photos[i % photos.length];
  const names: Record<string, string[]> = {
    electronica: [
      "Auriculares Bluetooth",
      "Raspberry Pi 4 Kit",
      "Smartwatch Sport",
      "Laptop UltraSlim",
      "Cámara Mirrorless",
      "Parlante Portátil",
    ],
    hogar: [
      "Refrigeradora 200L",
      "Silla Ergonómica",
      "Cafetera Espresso",
      "Lámpara LED",
      "Set de Sartenes",
      "Aspiradora Robot",
    ],
    supermercado: [
      "Banano Orgánico (1kg)",
      "Café Premium 500g",
      "Aceite de Oliva 1L",
      "Pasta Italiana",
      "Quinua Andina 1kg",
      "Chocolate 70%",
    ],
    moda: [
      "Zapatillas Runner",
      "Hoodie Oversize",
      "Reloj Clásico",
      "Mochila Urbana",
      "Lentes de Sol",
      "Camisa Lino",
    ],
    deportes: [
      "Balón Profesional",
      "Mancuernas 10kg",
      "Bicicleta MTB",
      "Yoga Mat Premium",
      "Botella Térmica",
      "Guantes Gym",
    ],
    libros: [
      "Sapiens",
      "Clean Code",
      "El Principito",
      "Atomic Habits",
      "Cien Años de Soledad",
      "The Pragmatic Programmer",
    ],
  };
  const name = names[cat.slug][Math.floor(i / STATIC_CATEGORIES.length) % 6];
  return {
    id: `p-${i + 1}`,
    name,
    description: `${name} de alta calidad, vendido por ${seller[i % seller.length]}. Envío rápido desde nuestro depósito local. Garantía de 12 meses y devolución gratuita en 30 días.`,
    price: Math.round((9 + ((i * 7) % 480)) * 100) / 100,
    stock: 3 + ((i * 5) % 40),
    image: `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=600&q=70`,
    category: cat.slug,
    seller: seller[i % seller.length],
    rating: 3.5 + (i % 4) * 0.4,
    reviews: 12 + ((i * 17) % 800),
  };
});

export function findStaticProduct(id: string): Product | undefined {
  return STATIC_PRODUCTS.find((p) => p.id === id);
}

export function productsByCategorySlugStatic(slug: string): Product[] {
  return STATIC_PRODUCTS.filter((p) => p.category === slug);
}

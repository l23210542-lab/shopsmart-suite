export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
};

export const categories = [
  { slug: "electronica", name: "Electrónica" },
  { slug: "hogar", name: "Hogar y Cocina" },
  { slug: "supermercado", name: "Supermercado" },
  { slug: "moda", name: "Moda" },
  { slug: "deportes", name: "Deportes" },
  { slug: "libros", name: "Libros" },
];

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=600&q=70&q-${encodeURIComponent(q)}`;

// Use a curated set of working Unsplash photo IDs
const photos = [
  "1505740420928-5e560c06d30e", // headphones
  "1572569511254-d8f925fe2cbb", // raspberry pi board
  "1571171637578-41bc2dd41cd2", // refrigerator
  "1542838132-92c53300491e",   // bananas
  "1606813907291-d86efa9b94db", // sneakers
  "1546868871-7041f2a55e12",   // smart watch
  "1593642632559-0c6d3fc62b89", // laptop
  "1526170375885-4d8ecf77b99f", // camera
  "1542291026-7eec264c27ff",   // red shoes
  "1585386959984-a4155224a1ad", // perfume
  "1523275335684-37898b6baf30", // watch wood
  "1558618666-fcd25c85cd64",   // chair
  "1550009158-9ebf69173e03",   // home decor
  "1583394838336-acd977736f90", // espresso
  "1574629810360-7efbbe195018", // hoodie
  "1542367597-8849eb950fd8",   // football
  "1481627834876-b7833e8f5570", // books
  "1512820790803-83ca734da794", // book stack
];

const seller = ["TechBay", "Casa Andina", "Mercado Express", "ModaPlus", "DeportesPro", "LibroMundo"];

export const products: Product[] = Array.from({ length: 36 }, (_, i) => {
  const cat = categories[i % categories.length];
  const photo = photos[i % photos.length];
  const names: Record<string, string[]> = {
    electronica: ["Auriculares Bluetooth", "Raspberry Pi 4 Kit", "Smartwatch Sport", "Laptop UltraSlim", "Cámara Mirrorless", "Parlante Portátil"],
    hogar: ["Refrigeradora 200L", "Silla Ergonómica", "Cafetera Espresso", "Lámpara LED", "Set de Sartenes", "Aspiradora Robot"],
    supermercado: ["Banano Orgánico (1kg)", "Café Premium 500g", "Aceite de Oliva 1L", "Pasta Italiana", "Quinua Andina 1kg", "Chocolate 70%"],
    moda: ["Zapatillas Runner", "Hoodie Oversize", "Reloj Clásico", "Mochila Urbana", "Lentes de Sol", "Camisa Lino"],
    deportes: ["Balón Profesional", "Mancuernas 10kg", "Bicicleta MTB", "Yoga Mat Premium", "Botella Térmica", "Guantes Gym"],
    libros: ["Sapiens", "Clean Code", "El Principito", "Atomic Habits", "Cien Años de Soledad", "The Pragmatic Programmer"],
  };
  const name = names[cat.slug][Math.floor(i / categories.length) % 6];
  return {
    id: `p-${i + 1}`,
    name,
    description: `${name} de alta calidad, vendido por ${seller[i % seller.length]}. Envío rápido desde nuestro depósito local. Garantía de 12 meses y devolución gratuita en 30 días.`,
    price: Math.round((9 + (i * 7) % 480) * 100) / 100,
    stock: 3 + (i * 5) % 40,
    image: `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=600&q=70`,
    category: cat.slug,
    seller: seller[i % seller.length],
    rating: 3.5 + ((i % 4) * 0.4),
    reviews: 12 + (i * 17) % 800,
  };
});

export const productsByCategory = (slug: string) =>
  products.filter((p) => p.category === slug);

export const findProduct = (id: string) => products.find((p) => p.id === id);

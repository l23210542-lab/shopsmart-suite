export interface Category {
  slug: string;
  name: string;
}

export interface Product {
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
}

export interface AppCatalogBundle {
  products: Product[];
  categories: Category[];
  source: "static" | "mariadb";
}

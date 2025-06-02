export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  category_id: number;
  category_name?: number;
  featured: boolean;
  rating: number;
  stock: number;
  tags?: string[];
  pivot?: Pivot;
}

export interface Pivot {
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ListProduct {
  pagination: Pagination;
  data: Product[];
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc ' | 'price_desc ' | 'rating' | 'recent ';
  page?: number;
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Order {
  id: number;
  total: number;
  sub_total: number;
  igv: number;
  status: string;
  products: Product[];
}

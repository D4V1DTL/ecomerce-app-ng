import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import {
  Category,
  Pagination,
  Product,
  ProductFilters,
} from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  pagination: Pagination = {
    current_page: 0,
    per_page: 0,
    total: 0,
    last_page: 0,
    from: 0,
    to: 0,
  };
  categories: Category[] = [];
  loading = true;

  // Filter state
  filters: ProductFilters = {};

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load categories
    this.loadCategories();

    // Check for query params
    this.route.queryParams.subscribe((params) => {
      // Initialize filters from URL params
      this.filters = {
        search: params['search'] || undefined,
        category_id: params['category_id'] || undefined,
        minPrice: params['minPrice'] ? Number(params['minPrice']) : undefined,
        maxPrice: params['maxPrice'] ? Number(params['maxPrice']) : undefined,
        sortBy: (params['sortBy'] as any) || undefined,
        page: params['page'] ? Number(params['page']) : 1, // Default to page 1
      };

      // Load products based on filters
      this.loadProducts();
    });
  }

  get pages(): number[] {
    if (!this.pagination) return [];
    return Array.from({ length: this.pagination.last_page }, (_, i) => i + 1);
  }

  loadCategories(): void {
    this.productService.getProductCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.filters).subscribe(
      (products) => {
        this.products = products.data;
        this.pagination = products.pagination;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading products', error);
        this.loading = false;
      }
    );
  }

  onFiltersChange(): void {
    // Update the URL with the current filters
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    // Build query params object, omitting undefined values

    const queryParams: any = {};

    if (this.filters.search && this.filters.search.length > 0) {
      queryParams.search = this.filters.search;
    }

    if (this.filters.category_id) {
      queryParams.category_id = this.filters.category_id;
    }

    if (this.filters.minPrice !== undefined && this.filters.minPrice > 0) {
      queryParams.minPrice = this.filters.minPrice;
    }

    if (this.filters.maxPrice !== undefined && this.filters.maxPrice > 0) {
      queryParams.maxPrice = this.filters.maxPrice;
    }

    if (this.filters.sortBy) {
      queryParams.sortBy = this.filters.sortBy;
    }

    // Update the URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  removeFilter(filterType: string): void {
    switch (filterType) {
      case 'search':
        this.filters.search = undefined;
        break;
      case 'category_id':
        this.filters.category_id = undefined;
        break;
      case 'price':
        this.filters.minPrice = undefined;
        this.filters.maxPrice = undefined;
        break;
    }

    this.onFiltersChange();
  }

  clearFilters(): void {
    this.filters = {};
    this.onFiltersChange();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    // In a real app, you might want to show a toast notification here
  }

  goToPage(page: number): void {
    // Actualiza el filtro de página
    this.filters.page = page;

    // Actualiza los queryParams en la URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.filters, page },
      queryParamsHandling: 'merge', // Mantiene los demás filtros
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Category, Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService
      .getProductCategories()
      .subscribe((categories: Category[]) => {
        this.categories = categories;
      });
    this.productService.getFeaturedProducts().subscribe((products) => {
      this.featuredProducts = products;
      this.loading = false;
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    // In a real app, you might want to show a toast notification here
  }
}

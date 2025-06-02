import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./product-detail.component.html"
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | undefined>(undefined);
  loading = signal(true);
  quantity = 1;
  
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      } else {
        this.handleProductNotFound();
      }
    });
  }
  
  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe(
      product => {
        this.product.set(product);
        this.loading.set(false);
        
        // Reset quantity whenever product changes
        this.quantity = 1;
      },
      error => {
        console.error('Error loading product', error);
        this.loading.set(false);
        this.handleProductNotFound();
      }
    );
  }
  
  handleProductNotFound(): void {
    this.product.set(undefined);
  }
  
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
  incrementQuantity(): void {
    if (this.product() && this.quantity < this.product()!.stock) {
      this.quantity++;
    }
  }
  
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  addToCart(): void {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.quantity);
      // In a real app, you'd show a toast notification here
    }
  }
}
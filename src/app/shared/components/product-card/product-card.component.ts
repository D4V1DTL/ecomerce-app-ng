import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./product-card.component.html",
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  
  addToCart(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.addToCartEvent.emit(this.product);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = true;

  // Order summary calculations
  cartTotal = 0;
  shippingCost = 9.99;
  tax = 0;
  orderTotal = 0;

  constructor(
    private cartService: CartService,
    private router: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;

    this.cartService.getCartItems().subscribe((items) => {
      this.cartItems = items;
      this.calculateTotals();
      this.loading = false;
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
    this.calculateTotals();
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.calculateTotals();
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  private calculateTotals(): void {
    // Calculate cart subtotal
    this.cartTotal = this.cartItems.reduce(
      (total, item) =>
        total +
        (item.product.discountPrice || item.product.price) * item.quantity,
      0
    );

    // Calculate tax
    this.tax = this.cartTotal * 0.1; // 10% tax

    // Determine shipping cost - free if over $50
    this.shippingCost = this.cartTotal >= 50 ? 0 : 9.99;

    // Calculate final total
    this.orderTotal = this.cartTotal + this.tax + this.shippingCost;
  }

  checkout(): void {
    this.cartService.checkout().subscribe({
      next: (res) => {
        // Suponiendo que la respuesta tiene el id de la orden creada
        this.cartService.clearCart(); // Limpiar el carrito en localStorage
        const orderId = res?.order?.id;
        if (orderId) {
          location.href = `/orders/${orderId}`;
        }
      },
      error: (err) => {
        // Maneja el error (puedes mostrar un mensaje)
        console.error('Error en checkout', err);
      },
    });
  }
}

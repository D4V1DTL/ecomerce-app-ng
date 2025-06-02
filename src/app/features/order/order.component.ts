import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/product.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;

    this.orderService.getOrders().subscribe((items) => {
      this.orders = items;
      this.loading = false;
    });
  }
}

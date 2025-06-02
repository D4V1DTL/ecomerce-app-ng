import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../core/models/product.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  order: Order = {} as Order;
  loading = true;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadCart(id);
      }
    });
  }

  loadCart(id: number): void {
    this.loading = true;
    this.orderService.show(id).subscribe((item) => {
      this.order = item;
      this.loading = false;
    });
  }
}

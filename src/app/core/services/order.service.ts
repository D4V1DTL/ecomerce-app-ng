import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem, Order, Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.apiUrl; // Replace with your actual API URL
  private OrderItems = new BehaviorSubject<Order[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {
    this.authService.getAuthState().subscribe((authState) => {
      if (authState.isAuthenticated && authState.user) {
        this.load(authState.user.id); // Puedes cargar un carrito específico del usuario aquí
      } else {
        this.load(0); // O limpiar el carrito si no hay usuario
      }
    });
  }

  // Get all Order items
  getOrders(): Observable<Order[]> {
    return this.OrderItems.asObservable();
  }

  // Load Order from localStorage
  private load(user_id: number): void {
    if (user_id !== 0) {
      this.http.get<any>(`${this.apiUrl}/orders`).subscribe({
        next: (serverCart) => {
          this.OrderItems.next(serverCart.orders);
        },
        error: () => {
          this.OrderItems.next([]);
        },
      });
    } else {
      // Usuario no autenticado: solo usa el carrito local
      this.OrderItems.next([]);
    }
  }

  public show(order_id: number): Observable<Order> {
    return this.http.get<any>(`${this.apiUrl}/orders/${order_id}`).pipe(
      map((response) => {
        return response.order;
      })
    );
  }
}

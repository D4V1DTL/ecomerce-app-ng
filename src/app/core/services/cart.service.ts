import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem, Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.apiUrl; // Replace with your actual API URL
  private cartItems = new BehaviorSubject<CartItem[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {
    this.authService.getAuthState().subscribe((authState) => {
      if (authState.isAuthenticated && authState.user) {
        this.loadCart(authState.user.id); // Puedes cargar un carrito específico del usuario aquí
      } else {
        this.loadCart(0); // O limpiar el carrito si no hay usuario
      }
    });
  }

  // Get all cart items
  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  // Get cart total
  getCartTotal(): Observable<number> {
    return this.cartItems.pipe(
      map((items) =>
        items.reduce(
          (total, item) =>
            total +
            (item.product.discountPrice || item.product.price) * item.quantity,
          0
        )
      )
    );
  }

  // Get total number of items in cart
  getCartItemCount(): Observable<number> {
    return this.cartItems.pipe(
      map((items) => items.reduce((count, item) => count + item.quantity, 0))
    );
  }

  // Add product to cart
  addToCart(product: Product, quantity: number = 1): void {
    const token = localStorage.getItem('auth_token');
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === product.id
    );

    let updatedItems: CartItem[];

    if (existingItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      updatedItems = currentItems.map((item, index) => {
        if (index === existingItemIndex) {
          return { ...item, quantity: item.quantity + quantity };
        }
        return item;
      });
    } else {
      // Otherwise, add a new item
      updatedItems = [
        ...currentItems,
        {
          quantity: quantity,
          product: product,
        },
      ];
    }

    if (token) {
      this.http
        .post(`${this.apiUrl}/cart/add`, { product_id: product.id, quantity })
        .subscribe(
          (res: any) => {
            this.cartItems.next(updatedItems);
            this.saveCart();
          },
          (err) => {}
        );
    } else {
      this.cartItems.next(updatedItems);
      this.saveCart();
    }
  }

  // Update quantity of a cart item
  updateQuantity(productId: number, quantity: number): void {
    const token = localStorage.getItem('auth_token');
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updatedItems = this.cartItems.value.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    if (token) {
      this.http
        .post(`${this.apiUrl}/cart/add`, { product_id: productId, quantity })
        .subscribe(
          (res: any) => {
            this.cartItems.next(updatedItems);
            this.saveCart();
          },
          (err) => {}
        );
    } else {
      this.cartItems.next(updatedItems);
      this.saveCart();
    }
  }

  // Remove item from cart
  removeFromCart(productId: number): void {
    const token = localStorage.getItem('auth_token');
    const updatedItems = this.cartItems.value.filter(
      (item) => item.product.id !== productId
    );
    if (token) {
      this.http.delete(`${this.apiUrl}/cart/remove/${productId}`).subscribe({
        next: () => {
          this.cartItems.next(updatedItems);
          this.saveCart();
        },
        error: (err) => {
          // Maneja el error si es necesario
          console.error(
            'Error eliminando producto del carrito en el backend',
            err
          );
          // Actualiza localmente de todas formas
          this.cartItems.next(updatedItems);
          this.saveCart();
        },
      });
    } else {
      this.cartItems.next(updatedItems);
      this.saveCart();
    }
  }

  // Clear the entire cart
  clearCart(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.http.delete(`${this.apiUrl}/cart/clear`, {}).subscribe({
        next: () => {
          this.cartItems.next([]);
          this.saveCart();
        },
        error: (err) => {
          console.error('Error limpiando el carrito en el backend', err);
          // Limpia localmente de todas formas
          this.cartItems.next([]);
          this.saveCart();
        },
      });
    } else {
      this.cartItems.next([]);
      this.saveCart();
    }
  }

  // Save cart to localStorage
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  // Load cart from localStorage
  private loadCart(user_id: number): void {
    const savedCart = localStorage.getItem('cart');
    let localCart: CartItem[] = [];
    if (savedCart) {
      try {
        localCart = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
        localCart = [];
      }
    }

    if (user_id !== 0) {
      this.http.get<CartItem[]>(`${this.apiUrl}/cart`).subscribe({
        next: (serverCart) => {
          const areCartsEqual = (a: CartItem[], b: CartItem[]) => {
            if (a.length !== b.length) return false;
            const sortFn = (x: CartItem, y: CartItem) =>
              x.product.id - y.product.id;
            const sortedA = [...a].sort(sortFn);
            const sortedB = [...b].sort(sortFn);
            return sortedA.every(
              (item, idx) =>
                item.product.id === sortedB[idx].product.id &&
                item.quantity === sortedB[idx].quantity
            );
          };

          if (areCartsEqual(serverCart, localCart)) {
            // Si son iguales, usa solo el serverCart
            this.cartItems.next(serverCart);
            localStorage.setItem('cart', JSON.stringify(serverCart));
          } else {
            // Si son diferentes, mergea ambos carritos

            const mergedCart: CartItem[] = [...serverCart];
            localCart.forEach((localItem) => {
              const idx = mergedCart.findIndex(
                (item) => item.product.id === localItem.product.id
              );
              if (idx !== -1) {
                mergedCart[idx].quantity = Math.max(
                  mergedCart[idx].quantity,
                  localItem.quantity
                );
              } else {
                mergedCart.push(localItem);
              }
            });
            // Sincroniza el carrito merged con el backend
            const payload = mergedCart.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
            }));

            this.http
              .post(`${this.apiUrl}/cart/sync`, { items: payload })
              .subscribe({
                next: (res: any) => {
                  this.cartItems.next(res.results);
                  localStorage.setItem('cart', JSON.stringify(res.results));
                },
                error: (err) => {
                  console.error(
                    'Error sincronizando carrito con el backend',
                    err
                  );
                },
              });
          }
        },
        error: () => {
          this.cartItems.next(localCart);
        },
      });
    } else {
      // Usuario no autenticado: solo usa el carrito local
      this.cartItems.next(localCart);
    }
  }

  checkout(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    localStorage.setItem('cart', JSON.stringify([])); // Limpiar carrito en localStorage
    this.cartItems.next([]); // Limpiar el carrito en memoria
    return this.http.post(`${this.apiUrl}/checkout`, {});
  }
}

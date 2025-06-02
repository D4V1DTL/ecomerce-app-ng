import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
        title: 'ShopSmart - Inicio',
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/catalog/catalog.component').then(
            (m) => m.CatalogComponent
          ),
        title: 'ShopSmart - Catalogo',
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
        title: 'ShopSmart - Detalle del Producto',
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cart/cart.component').then((m) => m.CartComponent),
        title: 'ShopSmart - Carrito de Compras',
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
        title: 'ShopSmart - Ordenes de Compras',
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/order/order.component').then(
            (m) => m.OrderComponent
          ),
        title: 'ShopSmart - Ordenes de Compras',
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'ShopSmart - Iniciar Sesión',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'ShopSmart - Registrarse',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

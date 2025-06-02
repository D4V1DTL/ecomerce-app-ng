import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthState } from '../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styles: [
    `
      :host {
        display: block;
      }

      .scrolled {
        @apply bg-white shadow-md;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  scrolled = false;
  showUserMenu = false;
  showMobileMenu = false;
  cartItemCount$: Observable<number>;
  authState$: Observable<AuthState>;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.cartItemCount$ = this.cartService.getCartItemCount();
    this.authState$ = this.authService.getAuthState();
  }

  ngOnInit(): void {
    // Check initial scroll position
    this.onScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close the user menu when clicking outside
    if (this.showUserMenu && !(event.target as Element).closest('.group')) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  login(): void {
    // For demo purposes, we'll simulate a login
    window.location.href = '/auth/login';
    this.showUserMenu = false;
  }

  Register(): void {
    // For demo purposes, we'll simulate a login
    window.location.href = '/auth/register';
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }
}

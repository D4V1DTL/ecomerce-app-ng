import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return true;
  } else {
    // Redirige a login si no hay token
    window.location.href = '/auth/login';
    return false;
  }
};

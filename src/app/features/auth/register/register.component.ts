import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  userData: RegisterRequest = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  };
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    if (this.userData.password !== this.userData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      await this.authService.register(this.userData).toPromise();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err.message || 'Failed to register. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}

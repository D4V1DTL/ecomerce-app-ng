import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await this.authService.login(this.credentials).toPromise();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err.message || 'Failed to login. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  public alert(message: string): void {
    alert(message);
  }
}

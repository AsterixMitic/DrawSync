import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  tab: 'login' | 'register' = 'login';
  loading = false;
  error = '';

  login = { email: '', password: '' };
  register = { name: '', email: '', password: '' };

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/home']);
  }

  onLogin(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.login.email, this.login.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => { this.error = err.error?.error ?? 'Login failed'; this.loading = false; },
    });
  }

  onRegister(): void {
    this.error = '';
    this.loading = true;
    this.auth.register(this.register.name, this.register.email, this.register.password).subscribe({
      next: () => { this.tab = 'login'; this.loading = false; this.error = ''; },
      error: err => { this.error = err.error?.error ?? 'Registration failed'; this.loading = false; },
    });
  }
}

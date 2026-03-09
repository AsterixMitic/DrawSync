import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  totalScore: number;
}

interface ApiResponse<T> { success: boolean; data: T; error?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get token(): string | null { return localStorage.getItem('ds_token'); }
  get user(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.token && !!this.user; }

  register(name: string, email: string, password: string) {
    return this.http.post<ApiResponse<{ user: User }>>(`${environment.apiUrl}/auth/register`, { name, email, password })
      .pipe(tap(res => { if (res.success) this.saveUser(res.data.user); }));
  }

  login(email: string, password: string) {
    return this.http.post<ApiResponse<{ accessToken: string; user: User }>>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => { if (res.success) { localStorage.setItem('ds_token', res.data.accessToken); this.saveUser(res.data.user); } }));
  }

  logout(): void {
    localStorage.removeItem('ds_token');
    localStorage.removeItem('ds_user');
    this.userSubject.next(null);
  }

  private saveUser(user: User): void {
    localStorage.setItem('ds_user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('ds_user');
    return raw ? JSON.parse(raw) : null;
  }
}

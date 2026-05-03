import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, User } from '../models/user.model';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'sprint_token';
  private readonly USER_KEY  = 'sprint_user';

  // Gateway prefix: /gateway/auth  → service path: /**
  // Full URL: http://localhost:8080/gateway/auth/signup
  private base = environment.gatewayAuth;

  private _token  = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user   = signal<User | null>(this.loadUser());

  readonly isLoggedIn  = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly isAdmin     = computed(() => this.normalizeRole(this._user()?.role) === 'ADMIN');

  constructor(
    private http: HttpClient,
    private router: Router,
    private cartService: CartService,
  ) {
    if (!this._user()) {
      this._token.set(null);
    }
  }

  login(payload: LoginRequest): Observable<HttpResponse<void>> {
    return this.http
      .post<void>(`${this.base}/login`, payload, { observe: 'response' })
      .pipe(
        tap(res => {
          // JWT is returned in the Authorization response header
          const authHeader = res.headers.get('Authorization') ?? res.headers.get('authorization');
          if (authHeader?.startsWith('Bearer ')) {
            this.storeToken(authHeader.substring(7));
          }
        })
      );
  }

  signup(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.base}/signup`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.cartService.clearLocalCart();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private storeToken(token: string): void {
    this.cartService.clearLocalCart();
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
    const user = this.decodeUser(token);
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this._user.set(user);
    }
  }

  private decodeUser(token: string): User | null {
    try {
      const payload = JSON.parse(this.decodeJwtPayload(token));
      const id = Number(payload.id);
      if (!Number.isFinite(id) || id <= 0) {
        return null;
      }

      return {
        id,
        username: payload.sub ?? payload.username ?? '',
        email:    payload.email ?? '',
        role:     this.normalizeRole(payload.role),
      };
    } catch {
      return null;
    }
  }

  private decodeJwtPayload(token: string): string {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return atob(padded);
  }

  private normalizeRole(role: unknown): User['role'] {
    const normalized = String(role ?? 'USER').replace(/^ROLE_/, '').trim().toUpperCase();
    return normalized === 'ADMIN' || normalized === 'CUSTOMER' ? normalized : 'USER';
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) return null;

      const user = JSON.parse(raw) as User;
      if (!Number.isFinite(Number(user.id)) || Number(user.id) <= 0) {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }
}

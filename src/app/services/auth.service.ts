import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/models';
import { StateService } from './state.service';

const SESSION_KEY = 'raiseit_session_v2';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private stateService = inject(StateService);
  readonly currentUser = signal<User | null>(this.restoreSession());

  private restoreSession(): User | null {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) return null;
    return this.stateService.findUserById(sessionId);
  }

  signIn(email: string, password: string): { user?: User; error?: string } {
    const user = this.stateService.findUserByEmail(email);
    if (!user || user.password !== password) return { error: 'Incorrect email or password.' };
    return { user };
  }

  setSession(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(SESSION_KEY, user.id);
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  resyncCurrentUser(): void {
    const user = this.currentUser();
    if (!user) return;
    const fresh = this.stateService.findUserById(user.id);
    if (!fresh) {
      this.currentUser.set(null);
      localStorage.removeItem(SESSION_KEY);
    } else {
      this.currentUser.set(fresh);
    }
  }
}

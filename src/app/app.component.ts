import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { StateService } from './services/state.service';
import { AuthComponent } from './components/auth/auth.component';
import { ShellComponent } from './components/shell/shell.component';
import { ToastComponent } from './components/toast/toast.component';

const RESYNC_INTERVAL_MS = 15000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AuthComponent, ShellComponent, ToastComponent],
  template: `
    @if (authService.currentUser()) {
      <app-shell />
    } @else {
      <app-auth />
    }
    <app-toast />
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private stateService = inject(StateService);

  private intervalId?: ReturnType<typeof setInterval>;
  private storageListener = (e: StorageEvent) => {
    if (e.key === 'raiseit_state_v2') this.resync();
  };

  ngOnInit(): void {
    window.addEventListener('storage', this.storageListener);
    this.intervalId = setInterval(() => this.resync(), RESYNC_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageListener);
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private resync(): void {
    this.stateService.resyncFromStorage();
    this.authService.resyncCurrentUser();
  }
}

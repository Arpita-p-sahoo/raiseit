import { Component, computed, inject, signal } from '@angular/core';
import { Role } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { Route, UiStateService } from '../../services/ui-state.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { BrandComponent } from '../brand/brand.component';
import { roleLabel } from '../../util/format';

interface NavItem {
  key: Route;
  label: string;
}

const NAV: Record<string, NavItem[]> = {
  customer: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'settings', label: 'Settings' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'company', label: 'Company' },
    { key: 'liveGraph', label: 'Live Graph' },
    { key: 'settings', label: 'Settings' },
  ],
  superadmin: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'companies', label: 'Companies' },
    { key: 'users', label: 'Users' },
    { key: 'liveGraph', label: 'Live Graph' },
    { key: 'settings', label: 'Settings' },
  ],
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AvatarComponent, BrandComponent],
  template: `
    <aside class="sidebar">
      <app-brand size="sm" />
      <nav class="nav-list">
        @for (item of navItems(); track item.key) {
          <button type="button" class="nav-item" [class.active]="ui.route() === item.key" (click)="ui.setRoute(item.key)">
            {{ item.label }}
          </button>
        }
      </nav>
      <div class="sidebar-footer">
        <button type="button" class="user-card" (click)="ui.setRoute('settings')">
          <app-avatar [name]="user()!.name" [size]="34" />
          <span class="user-card-copy">
            <span class="user-card-name">{{ user()!.name }}</span>
            <span class="user-card-role">{{ roleLabel(user()!.role) }}{{ companySuffix() }}</span>
          </span>
        </button>
        <button type="button" class="btn btn--ghost btn--sm btn--block" (click)="authService.logout()">Log out</button>
      </div>
      <button
        type="button"
        class="menu-toggle"
        aria-label="Open menu"
        [attr.aria-expanded]="menuOpen()"
        (click)="menuOpen.set(true)"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </aside>
    @if (menuOpen()) {
      <button type="button" class="menu-backdrop" aria-label="Close menu" (click)="menuOpen.set(false)"></button>
      <div class="mobile-menu">
        <button type="button" class="user-card" (click)="goSettings()">
          <app-avatar [name]="user()!.name" [size]="38" />
          <span class="user-card-copy">
            <span class="user-card-name">{{ user()!.name }}</span>
            <span class="user-card-role">{{ roleLabel(user()!.role) }}{{ companySuffix() }}</span>
          </span>
        </button>
        <nav class="mobile-menu-nav">
          @for (item of navItems(); track item.key) {
            <button type="button" class="nav-item" [class.active]="ui.route() === item.key" (click)="selectRoute(item.key)">
              {{ item.label }}
            </button>
          }
        </nav>
        <button type="button" class="btn btn--ghost btn--sm btn--block" (click)="logout()">Log out</button>
      </div>
    }
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
  private stateService = inject(StateService);
  ui = inject(UiStateService);

  roleLabel = roleLabel;
  menuOpen = signal(false);

  user = computed(() => this.authService.currentUser());
  navItems = computed<NavItem[]>(() => NAV[this.user()?.role ?? 'customer'] ?? []);
  companySuffix = computed(() => {
    const u = this.user();
    if (!u?.companyId) return '';
    const c = this.stateService.companyById(u.companyId);
    return c ? ' · ' + c.name : '';
  });

  selectRoute(route: Route): void {
    this.menuOpen.set(false);
    this.ui.setRoute(route);
  }

  goSettings(): void {
    this.menuOpen.set(false);
    this.ui.setRoute('settings');
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
  }
}

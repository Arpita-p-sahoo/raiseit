import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UiStateService } from '../../services/ui-state.service';
import { AdminDashboardComponent } from '../dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from '../dashboard/customer-dashboard.component';
import { SuperAdminDashboardComponent } from '../dashboard/superadmin-dashboard.component';
import { CompanyPageComponent } from '../company/company-page.component';
import { CompaniesPageComponent } from '../companies/companies-page.component';
import { UsersPageComponent } from '../users/users-page.component';
import { SettingsPageComponent } from '../settings/settings-page.component';
import { LiveGraphPageComponent } from '../live-graph/live-graph-page.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    SidebarComponent,
    CustomerDashboardComponent,
    AdminDashboardComponent,
    SuperAdminDashboardComponent,
    CompanyPageComponent,
    CompaniesPageComponent,
    UsersPageComponent,
    SettingsPageComponent,
    LiveGraphPageComponent,
  ],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <div class="main-col">
        <header class="page-header">
          <div class="page-header-inner">
            <h1>{{ title() }}</h1>
            <div class="page-header-meta"><span class="live-dot"></span>Live</div>
          </div>
        </header>
        <div class="page-content">
          @switch (ui.route()) {
            @case ('dashboard') {
              @switch (role()) {
                @case ('customer') {
                  <app-customer-dashboard />
                }
                @case ('admin') {
                  <app-admin-dashboard />
                }
                @default {
                  <app-superadmin-dashboard />
                }
              }
            }
            @case ('company') {
              <app-company-page />
            }
            @case ('companies') {
              <app-companies-page />
            }
            @case ('users') {
              <app-users-page />
            }
            @case ('liveGraph') {
              <app-live-graph-page />
            }
            @default {
              <app-settings-page />
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ShellComponent {
  private authService = inject(AuthService);
  ui = inject(UiStateService);

  role = computed(() => this.authService.currentUser()?.role ?? 'customer');

  constructor() {
    effect(() => {
      const role = this.role();
      const route = this.ui.route();
      if (route === 'company' && role !== 'admin') this.ui.setRoute('dashboard');
      if ((route === 'companies' || route === 'users') && role !== 'superadmin') this.ui.setRoute('dashboard');
      if (route === 'liveGraph' && role !== 'admin' && role !== 'superadmin') this.ui.setRoute('dashboard');
    });
  }

  title = computed(() => {
    switch (this.ui.route()) {
      case 'dashboard':
        return 'Dashboard';
      case 'company':
        return 'Company';
      case 'companies':
        return 'Companies';
      case 'users':
        return 'Users';
      case 'liveGraph':
        return 'Live Graph';
      default:
        return 'Settings';
    }
  });
}

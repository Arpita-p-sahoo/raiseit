import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { ToastService } from '../../services/toast.service';
import { UiStateService } from '../../services/ui-state.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { formatDate, roleLabel } from '../../util/format';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [FormsModule, AvatarComponent],
  template: `
    <section class="panel">
      <div class="panel-head">
        <h2>All users</h2>
        <div class="filter-group">
          <select [value]="ui.filters().role" (change)="ui.setFilter('role', $any($event.target).value)">
            <option value="all">All roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Company Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Company</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filtered(); track u.id) {
              <tr>
                <td class="name-cell">
                  <app-avatar [name]="u.name" [size]="24" />
                  {{ u.name }}
                </td>
                <td>{{ u.email }}</td>
                <td><span class="chip chip--role">{{ roleLabel(u.role) }}</span></td>
                <td>{{ companyName(u.companyId) }}</td>
                <td>{{ formatDate(u.createdAt) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <h2>Grant Super Admin access</h2>
      <p class="panel-sub">
        Super Admin sees every company's tickets and data, so only an existing Super Admin can grant it — there is no
        public sign-up for this role.
      </p>
      @if (inviteError()) {
        <div class="form-error">{{ inviteError() }}</div>
      }
      <form class="invite-row" (submit)="$event.preventDefault(); invite()">
        <input [(ngModel)]="inviteName" name="inviteName" placeholder="Full name" required />
        <input [(ngModel)]="inviteEmail" name="inviteEmail" type="email" placeholder="Work email" required />
        <button type="submit" class="btn btn--ghost btn--sm">Invite Super Admin</button>
      </form>
    </section>
  `,
})
export class UsersPageComponent {
  private stateService = inject(StateService);
  private toastService = inject(ToastService);
  ui = inject(UiStateService);

  formatDate = formatDate;
  roleLabel = roleLabel;

  inviteName = '';
  inviteEmail = '';
  inviteError = signal<string | null>(null);

  filtered = computed(() => {
    const f = this.ui.filters();
    return this.stateService
      .state()
      .users.filter((u) => f.role === 'all' || u.role === f.role)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  companyName(companyId: string | null): string {
    if (!companyId) return '—';
    return this.stateService.companyById(companyId)?.name ?? '—';
  }

  invite(): void {
    const result = this.stateService.inviteSuperAdmin(this.inviteName, this.inviteEmail);
    if (result.error) {
      this.inviteError.set(result.error);
      return;
    }
    this.inviteError.set(null);
    const name = this.inviteName;
    this.inviteName = '';
    this.inviteEmail = '';
    this.toastService.show(name + ' granted Super Admin - temporary password: ' + result.tempPassword);
  }
}

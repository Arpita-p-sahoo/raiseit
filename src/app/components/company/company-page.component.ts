import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { INDUSTRIES, SIZES } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { ToastService } from '../../services/toast.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { formatDate } from '../../util/format';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [FormsModule, AvatarComponent],
  template: `
    @if (company(); as company) {
      <section class="panel">
        <h2>Company profile</h2>
        <p class="panel-sub">Registered {{ formatDate(company.createdAt) }}</p>
        @if (companyError()) {
          <div class="form-error">{{ companyError() }}</div>
        }
        <form (submit)="$event.preventDefault(); saveCompany()">
          <label class="field">
            Company name
            <input [(ngModel)]="name" name="name" required />
          </label>
          <label class="field">
            Industry
            <select [(ngModel)]="industry" name="industry">
              @for (i of industries; track i) {
                <option [value]="i">{{ i }}</option>
              }
            </select>
          </label>
          <label class="field">
            Company size
            <select [(ngModel)]="size" name="size">
              @for (s of sizes; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </label>
          <button type="submit" class="btn btn--primary">Save company profile</button>
        </form>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Team</h2>
          <span class="count-badge">{{ team().length }}</span>
        </div>
        <div class="roster">
          @for (u of team(); track u.id) {
            <div class="roster-row">
              <app-avatar [name]="u.name" [size]="32" />
              <div class="roster-copy">
                <span class="roster-name">{{ u.name }}</span>
                <span class="roster-email">{{ u.email }}</span>
              </div>
              @if (u.id === currentUserId()) {
                <span class="roster-tag">You</span>
              }
            </div>
          }
        </div>
        @if (inviteError()) {
          <div class="form-error">{{ inviteError() }}</div>
        }
        <form class="invite-row" (submit)="$event.preventDefault(); invite()">
          <input [(ngModel)]="inviteName" name="inviteName" placeholder="Teammate name" required />
          <input [(ngModel)]="inviteEmail" name="inviteEmail" type="email" placeholder="Work email" required />
          <button type="submit" class="btn btn--ghost btn--sm">Invite teammate</button>
        </form>
      </section>
    }
  `,
})
export class CompanyPageComponent {
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private toastService = inject(ToastService);

  industries = INDUSTRIES;
  sizes = SIZES;
  formatDate = formatDate;

  name = '';
  industry = INDUSTRIES[0];
  size = SIZES[0];
  inviteName = '';
  inviteEmail = '';

  companyError = signal<string | null>(null);
  inviteError = signal<string | null>(null);

  currentUserId = computed(() => this.authService.currentUser()?.id);

  company = computed(() => {
    const user = this.authService.currentUser();
    const c = user?.companyId ? this.stateService.companyById(user.companyId) : null;
    if (c) {
      this.name = c.name;
      this.industry = c.industry;
      this.size = c.size;
    }
    return c;
  });

  team = computed(() => {
    const c = this.company();
    if (!c) return [];
    return this.stateService
      .state()
      .users.filter((u) => u.companyId === c.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  saveCompany(): void {
    const c = this.company();
    if (!c) return;
    const result = this.stateService.updateCompanyProfile(c.id, this.name, this.industry, this.size);
    if (result.error) {
      this.companyError.set(result.error);
      return;
    }
    this.companyError.set(null);
    this.toastService.show('Company profile updated');
  }

  invite(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    const result = this.stateService.inviteTeammate(this.inviteName, this.inviteEmail, user);
    if (result.error) {
      this.inviteError.set(result.error);
      return;
    }
    this.inviteError.set(null);
    const name = this.inviteName;
    this.inviteName = '';
    this.inviteEmail = '';
    this.toastService.show(name + ' added - temporary password: ' + result.tempPassword);
  }
}

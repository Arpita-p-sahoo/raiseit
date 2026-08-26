import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { ThemeChoice, ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { roleLabel } from '../../util/format';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, AvatarComponent],
  template: `
    @if (user(); as user) {
      <section class="panel">
        <div class="settings-head">
          <app-avatar [name]="user.name" [size]="52" />
          <div class="settings-head-copy">
            <strong>{{ user.name }}</strong>
            <span>{{ user.email }}</span>
          </div>
        </div>
        <div class="settings-meta-row">
          <span class="chip chip--role">{{ roleLabel(user.role) }}</span>
          @if (companyName()) {
            <span class="chip chip--role">{{ companyName() }}</span>
          }
        </div>
        @if (settingsError()) {
          <div class="form-error">{{ settingsError() }}</div>
        }
        <form (submit)="$event.preventDefault(); save()">
          <label class="field">
            Full name
            <input [(ngModel)]="name" name="name" required />
          </label>
          <label class="field">
            Email
            <input type="email" [(ngModel)]="email" name="email" required />
          </label>
          <label class="checkbox-row">
            <input type="checkbox" [(ngModel)]="notify" name="notify" />
            Email me when a ticket I am involved in is updated
          </label>
          <button type="submit" class="btn btn--primary">Save changes</button>
        </form>
      </section>

      <section class="panel">
        <h2>Appearance</h2>
        <p class="panel-sub">Choose how RaiseIt looks on this device.</p>
        <div class="theme-toggle-row">
          <button type="button" class="seg-btn" [class.active]="themeChoice() === 'system'" (click)="setTheme('system')">System</button>
          <button type="button" class="seg-btn" [class.active]="themeChoice() === 'light'" (click)="setTheme('light')">Light</button>
          <button type="button" class="seg-btn" [class.active]="themeChoice() === 'dark'" (click)="setTheme('dark')">Dark</button>
        </div>
      </section>
    }
  `,
})
export class SettingsPageComponent {
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private themeService = inject(ThemeService);
  private toastService = inject(ToastService);

  roleLabel = roleLabel;

  name = '';
  email = '';
  notify = true;

  settingsError = signal<string | null>(null);

  user = computed(() => {
    const u = this.authService.currentUser();
    if (u) {
      this.name = u.name;
      this.email = u.email;
      this.notify = u.notify !== false;
    }
    return u;
  });

  companyName = computed(() => {
    const u = this.authService.currentUser();
    return u?.companyId ? this.stateService.companyById(u.companyId)?.name ?? '' : '';
  });

  themeChoice = computed<ThemeChoice>(() => this.themeService.choice());

  setTheme(choice: ThemeChoice): void {
    this.themeService.setChoice(choice);
  }

  save(): void {
    const u = this.authService.currentUser();
    if (!u) return;
    const result = this.stateService.updateProfile(u, this.name, this.email, this.notify);
    if (result.error) {
      this.settingsError.set(result.error);
      return;
    }
    this.settingsError.set(null);
    this.authService.resyncCurrentUser();
    this.toastService.show('Settings saved');
  }
}

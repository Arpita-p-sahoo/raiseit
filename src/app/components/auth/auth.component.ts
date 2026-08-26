import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { INDUSTRIES, SIZES } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { UiStateService } from '../../services/ui-state.service';
import { BrandComponent } from '../brand/brand.component';

type AuthTab = 'signin' | 'register';
type AuthType = 'customer' | 'company';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, BrandComponent],
  template: `
    <div class="auth-screen">
      <div class="auth-card">
        <app-brand size="lg" />
        <p class="auth-sub">
          One place to raise, track, and resolve support tickets across customers, companies, and oversight teams.
        </p>

        <div class="tab-row">
          <button type="button" [class.active]="authTab() === 'signin'" (click)="setTab('signin')">Sign in</button>
          <button type="button" [class.active]="authTab() === 'register'" (click)="setTab('register')">Register</button>
        </div>

        @if (authTab() === 'signin') {
          <form (submit)="$event.preventDefault(); onSignIn()">
            @if (authError()) {
              <div class="form-error">{{ authError() }}</div>
            }
            <label class="field">
              Email
              <input type="email" [(ngModel)]="signinEmail" name="email" required autocomplete="username" />
            </label>
            <label class="field">
              Password
              <input type="password" [(ngModel)]="signinPassword" name="password" required autocomplete="current-password" />
            </label>
            <button type="submit" class="btn btn--primary btn--block">Sign in</button>
          </form>
        } @else {
          <div class="type-toggle">
            <button type="button" class="type-card" [class.selected]="authType() === 'customer'" (click)="setType('customer')">
              <span class="role-badge">C</span>
              <span class="role-title">Customer</span>
              <span class="role-desc">Raise and track tickets with any registered company.</span>
            </button>
            <button type="button" class="type-card" [class.selected]="authType() === 'company'" (click)="setType('company')">
              <span class="role-badge">B</span>
              <span class="role-title">Register a company</span>
              <span class="role-desc">Create a workspace and manage incoming tickets.</span>
            </button>
          </div>

          <form (submit)="$event.preventDefault(); onRegister()">
            @if (authError()) {
              <div class="form-error">{{ authError() }}</div>
            }
            <label class="field">
              Full name
              <input [(ngModel)]="regName" name="name" required placeholder="e.g. Jordan Blake" />
            </label>
            <label class="field">
              Work email
              <input type="email" [(ngModel)]="regEmail" name="remail" required />
            </label>
            <label class="field">
              Password
              <input type="password" [(ngModel)]="regPassword" name="rpass" required minlength="6" placeholder="At least 6 characters" />
            </label>
            @if (authType() === 'company') {
              <label class="field">
                Company name
                <input [(ngModel)]="regCompanyName" name="companyName" required placeholder="e.g. Nimbus Cloud" />
              </label>
              <label class="field">
                Industry
                <select [(ngModel)]="regIndustry" name="industry">
                  @for (i of industries; track i) {
                    <option [value]="i">{{ i }}</option>
                  }
                </select>
              </label>
              <label class="field">
                Company size
                <select [(ngModel)]="regSize" name="size">
                  @for (s of sizes; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
              </label>
            }
            <button type="submit" class="btn btn--primary btn--block">
              {{ authType() === 'company' ? 'Register company' : 'Create account' }}
            </button>
          </form>
        }

        <p class="auth-hint">
          Demo accounts - Super Admin: <code>ava&#64;raiseit.io</code> / <code>superadmin</code><br />
          Company Admin: <code>tomas&#64;nimbuscloud.io</code> / <code>demo1234</code><br />
          Customer: <code>priya&#64;example.com</code> / <code>demo1234</code>
        </p>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private ui = inject(UiStateService);

  authTab = signal<AuthTab>('signin');
  authType = signal<AuthType>('customer');
  authError = signal<string | null>(null);

  industries = INDUSTRIES;
  sizes = SIZES;

  signinEmail = '';
  signinPassword = '';

  regName = '';
  regEmail = '';
  regPassword = '';
  regCompanyName = '';
  regIndustry = INDUSTRIES[0];
  regSize = SIZES[0];

  setTab(tab: AuthTab): void {
    this.authTab.set(tab);
    this.authError.set(null);
  }

  setType(type: AuthType): void {
    this.authType.set(type);
    this.authError.set(null);
  }

  onSignIn(): void {
    const result = this.authService.signIn(this.signinEmail, this.signinPassword);
    if (result.error) {
      this.authError.set(result.error);
      return;
    }
    this.authError.set(null);
    this.completeLogin(result.user);
  }

  onRegister(): void {
    if (this.regPassword.length < 6) {
      this.authError.set('Password must be at least 6 characters.');
      return;
    }
    let result;
    if (this.authType() === 'company') {
      if (!this.regCompanyName.trim()) {
        this.authError.set('Company name is required.');
        return;
      }
      result = this.stateService.registerCompany(
        this.regName,
        this.regEmail,
        this.regPassword,
        this.regCompanyName,
        this.regIndustry,
        this.regSize
      );
    } else {
      result = this.stateService.registerCustomer(this.regName, this.regEmail, this.regPassword);
    }
    if (result.error) {
      this.authError.set(result.error);
      return;
    }
    this.authError.set(null);
    this.completeLogin(result.user);
  }

  private completeLogin(user: ReturnType<AuthService['signIn']>['user']): void {
    if (!user) return;
    this.authService.setSession(user);
    this.ui.resetForNewSession();
  }
}

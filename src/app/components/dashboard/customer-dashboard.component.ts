import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIORITIES, Priority, Ticket } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { ToastService } from '../../services/toast.service';
import { UiStateService } from '../../services/ui-state.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { TicketCardComponent } from '../ticket-card/ticket-card.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [FormsModule, TicketCardComponent, EmptyStateComponent],
  template: `
    <div class="dash-grid">
      <section class="panel panel--form">
        <h2>Raise a ticket</h2>
        <form (submit)="$event.preventDefault(); submit()">
          <label class="field">
            Company
            <select [(ngModel)]="companyId" name="companyId" required>
              @for (c of companies(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </label>
          <label class="field">
            Subject
            <input type="text" [(ngModel)]="title" name="title" required maxlength="120" placeholder="Short summary of the issue" />
          </label>
          <label class="field">
            Priority
            <select [(ngModel)]="priority" name="priority">
              @for (p of priorities; track p) {
                <option [value]="p">{{ p }}</option>
              }
            </select>
          </label>
          <label class="field">
            Description
            <textarea
              [(ngModel)]="description"
              name="description"
              required
              rows="4"
              placeholder="What is happening? Steps to reproduce, error messages - anything that helps."
            ></textarea>
          </label>
          <button type="submit" class="btn btn--primary">Submit ticket</button>
        </form>
      </section>
      <section class="panel panel--list">
        <div class="panel-head">
          <h2>Your tickets</h2>
          <span class="count-badge">{{ myTickets().length }}</span>
        </div>
        @if (myTickets().length) {
          @for (t of myTickets(); track t.id) {
            <app-ticket-card [ticket]="t" [options]="{ showCompany: true, allowReply: true, allowStatus: false, replyRole: 'customer' }" />
          }
        } @else {
          <app-empty-state title="No tickets yet" sub="Raise your first ticket using the form - it will show up here right away." />
        }
      </section>
    </div>
  `,
})
export class CustomerDashboardComponent {
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private toastService = inject(ToastService);
  private ui = inject(UiStateService);

  priorities = PRIORITIES;

  companyId = '';
  title = '';
  priority: Priority = 'Medium';
  description = '';

  companies = computed(() =>
    [...this.stateService.state().companies].sort((a, b) => a.name.localeCompare(b.name))
  );

  constructor() {
    this.companyId = this.companies()[0]?.id ?? '';
  }

  myTickets = computed<Ticket[]>(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.stateService
      .state()
      .tickets.filter((t) => t.raisedById === user.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  submit(): void {
    const user = this.authService.currentUser();
    if (!user || !this.companyId || !this.title.trim() || !this.description.trim()) return;
    const ticket = this.stateService.raiseTicket(this.companyId, this.title, this.description, this.priority, user);
    this.ui.expandTicket(ticket.id);
    this.title = '';
    this.description = '';
    this.priority = 'Medium';
    this.toastService.show(ticket.id + ' raised');
  }
}

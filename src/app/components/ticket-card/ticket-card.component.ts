import { Component, inject, input } from '@angular/core';
import { STATUSES, Ticket, TicketCardOptions } from '../../models/models';
import { StateService } from '../../services/state.service';
import { UiStateService } from '../../services/ui-state.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { formatDate, roleLabel, statusSlug, timeAgo } from '../../util/format';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  template: `
    <article class="ticket-card" [class]="'priority-' + ticket().priority.toLowerCase()">
      <button
        type="button"
        class="ticket-summary"
        (click)="ui.toggleTicket(ticket().id)"
        [attr.aria-expanded]="expanded()"
      >
        <span class="ticket-id">{{ ticket().id }}</span>
        <span class="ticket-title">{{ ticket().title }}</span>
        @if (options().showCompany && company()) {
          <span class="ticket-company">{{ company()!.name }}</span>
        }
        <span class="chip" [class]="'chip--status-' + statusSlug(ticket().status)">{{ ticket().status }}</span>
        <span class="chip" [class]="'chip--priority-' + ticket().priority.toLowerCase()">{{ ticket().priority }}</span>
        <span class="ticket-time">{{ timeAgo(ticket().updatedAt) }}</span>
      </button>

      @if (expanded()) {
        <div class="ticket-detail">
          <div class="thread">
            @for (msg of ticket().activity; track $index) {
              <div class="thread-msg" [class]="'thread-msg--' + msg.role">
                <div class="thread-meta">
                  <span class="thread-name">{{ msg.name }}</span>
                  <span class="thread-role">{{ roleLabel(msg.role) }}</span>
                  <span class="thread-time" [title]="msg.at">{{ timeAgo(msg.at) }}</span>
                </div>
                <p class="thread-text">{{ msg.message }}</p>
              </div>
            }
          </div>

          @if (options().allowStatus || options().allowReply) {
            <div class="detail-actions">
              @if (options().allowStatus) {
                <div class="status-row">
                  Status
                  <select [value]="ticket().status" (change)="onStatusChange($event)">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </div>
              }
              @if (options().allowReply) {
                <div class="reply-row">
                  <textarea #replyInput placeholder="Write a reply..."></textarea>
                  <button type="button" class="btn btn--primary btn--sm" (click)="onReply(replyInput)">Post</button>
                </div>
              }
            </div>
          } @else {
            <p class="oversight-note">Viewing as Super Admin - oversight only.</p>
          }
        </div>
      }
    </article>
  `,
})
export class TicketCardComponent {
  private stateService = inject(StateService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  ui = inject(UiStateService);

  ticket = input.required<Ticket>();
  options = input.required<TicketCardOptions>();

  statuses = STATUSES;

  expanded = () => !!this.ui.expandedTickets()[this.ticket().id];
  company = () => this.stateService.companyById(this.ticket().companyId);

  statusSlug = statusSlug;
  roleLabel = roleLabel;
  timeAgo = timeAgo;
  formatDate = formatDate;

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as Ticket['status'];
    const user = this.authService.currentUser();
    if (!user) return;
    this.stateService.setStatus(this.ticket().id, value, user);
    this.toastService.show('Status updated to ' + value);
  }

  onReply(textarea: HTMLTextAreaElement): void {
    const value = textarea.value.trim();
    if (!value) return;
    const user = this.authService.currentUser();
    if (!user) return;
    this.stateService.addActivity(this.ticket().id, value, this.options().replyRole, user);
    textarea.value = '';
    this.toastService.show('Reply posted');
  }
}

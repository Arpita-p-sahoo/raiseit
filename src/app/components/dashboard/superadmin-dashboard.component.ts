import { Component, computed, inject } from '@angular/core';
import { PRIORITIES, STATUSES, Status, Priority, Ticket } from '../../models/models';
import { StateService } from '../../services/state.service';
import { UiStateService } from '../../services/ui-state.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { StatTilesComponent } from '../stat-tiles/stat-tiles.component';
import { TicketCardComponent } from '../ticket-card/ticket-card.component';
import { LiveGraphChartComponent } from '../live-graph/live-graph-chart.component';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [TicketCardComponent, EmptyStateComponent, StatTilesComponent, LiveGraphChartComponent],
  template: `
    <app-live-graph-chart [tickets]="all()" scopeLabel="All companies" />
    <app-stat-tiles [counts]="counts()" [total]="all().length" />
    <section class="panel panel--list">
      <div class="panel-head">
        <h2>All tickets</h2>
        <div class="filter-group">
          <select [value]="ui.filters().company" (change)="ui.setFilter('company', $any($event.target).value)">
            <option value="all">All companies</option>
            @for (c of companies(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
          <select [value]="ui.filters().status" (change)="ui.setFilter('status', $any($event.target).value)">
            <option value="all">All status</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
          <select [value]="ui.filters().priority" (change)="ui.setFilter('priority', $any($event.target).value)">
            <option value="all">All priority</option>
            @for (p of priorities; track p) {
              <option [value]="p">{{ p }}</option>
            }
          </select>
        </div>
      </div>
      @if (filtered().length) {
        @for (t of filtered(); track t.id) {
          <app-ticket-card [ticket]="t" [options]="{ showCompany: true, allowReply: false, allowStatus: false, replyRole: 'superadmin' }" />
        }
      } @else {
        <app-empty-state title="No matching tickets" sub="Try widening your filters." />
      }
    </section>
  `,
})
export class SuperAdminDashboardComponent {
  private stateService = inject(StateService);
  ui = inject(UiStateService);

  statuses = STATUSES;
  priorities = PRIORITIES;

  all = computed<Ticket[]>(() => this.stateService.state().tickets);
  companies = computed(() => this.stateService.state().companies);

  counts = computed<Record<Status, number>>(() => {
    const c: Record<Status, number> = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    this.all().forEach((t) => (c[t.status] = (c[t.status] || 0) + 1));
    return c;
  });

  filtered = computed<Ticket[]>(() => {
    const f = this.ui.filters();
    return this.all()
      .filter(
        (t) =>
          (f.status === 'all' || t.status === (f.status as Status)) &&
          (f.priority === 'all' || t.priority === (f.priority as Priority)) &&
          (f.company === 'all' || t.companyId === f.company)
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });
}

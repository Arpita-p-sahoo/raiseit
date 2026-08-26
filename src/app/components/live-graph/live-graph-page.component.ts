import { Component, computed, inject } from '@angular/core';
import { PRIORITIES, Priority, STATUSES, Status, Ticket } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { StatTilesComponent } from '../stat-tiles/stat-tiles.component';
import { LiveGraphChartComponent } from './live-graph-chart.component';

interface ActivityRow {
  ticketId: string;
  ticketTitle: string;
  name: string;
  role: string;
  message: string;
  at: string;
}

@Component({
  selector: 'app-live-graph-page',
  standalone: true,
  imports: [StatTilesComponent, LiveGraphChartComponent],
  template: `
    <app-live-graph-chart [tickets]="scoped()" [scopeLabel]="scopeLabel()" [showMaximize]="false" />

    <app-stat-tiles [counts]="statusCounts()" [total]="scoped().length" />

    <div class="dash-grid">
      <section class="panel">
        <h2>By priority</h2>
        <div class="gradient-bars">
          @for (p of priorities; track p) {
            <div class="gradient-bar-row">
              <span class="gradient-bar-label">{{ p }}</span>
              <div class="gradient-bar-track">
                <div class="gradient-bar-fill" [class]="'gradient-bar-fill--' + p.toLowerCase()" [style.width.%]="priorityPct()[p]"></div>
              </div>
              <span class="gradient-bar-value">{{ priorityCounts()[p] }}</span>
            </div>
          }
        </div>
      </section>

      <section class="panel">
        <h2>Recent activity</h2>
        @if (recentActivity().length) {
          <div class="live-activity">
            @for (a of recentActivity(); track a.ticketId + a.at) {
              <div class="live-activity-row">
                <span class="live-activity-dot"></span>
                <div class="live-activity-copy">
                  <span class="live-activity-line"><strong>{{ a.name }}</strong> · {{ a.ticketTitle }}</span>
                  <span class="live-activity-time">{{ timeAgo(a.at) }}</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="panel-sub">No activity yet.</p>
        }
      </section>
    </div>

    @if (companyBreakdown().length) {
      <section class="panel">
        <h2>By company</h2>
        <div class="gradient-bars">
          @for (c of companyBreakdown(); track c.id) {
            <div class="gradient-bar-row gradient-bar-row--wide">
              <span class="gradient-bar-label" [title]="c.name">{{ c.name }}</span>
              <div class="gradient-bar-track">
                <div class="gradient-bar-fill gradient-bar-fill--company" [style.width.%]="c.pct"></div>
              </div>
              <span class="gradient-bar-value">{{ c.count }}</span>
            </div>
          }
        </div>
      </section>
    }
  `,
})
export class LiveGraphPageComponent {
  private authService = inject(AuthService);
  private stateService = inject(StateService);

  statuses = STATUSES;
  priorities = PRIORITIES;

  private user = computed(() => this.authService.currentUser());

  scopeLabel = computed(() => {
    const u = this.user();
    if (u?.role === 'admin') {
      const c = u.companyId ? this.stateService.companyById(u.companyId) : null;
      return c ? c.name : 'Your company';
    }
    return 'All companies';
  });

  scoped = computed<Ticket[]>(() => {
    const u = this.user();
    const all = this.stateService.state().tickets;
    if (u?.role === 'admin') return all.filter((t) => t.companyId === u.companyId);
    return all;
  });

  statusCounts = computed<Record<Status, number>>(() => {
    const c: Record<Status, number> = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    this.scoped().forEach((t) => (c[t.status] = (c[t.status] || 0) + 1));
    return c;
  });

  priorityCounts = computed<Record<Priority, number>>(() => {
    const c: Record<Priority, number> = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
    this.scoped().forEach((t) => (c[t.priority] = (c[t.priority] || 0) + 1));
    return c;
  });

  priorityPct = computed<Record<Priority, number>>(() => {
    const counts = this.priorityCounts();
    const max = Math.max(1, ...this.priorities.map((p) => counts[p]));
    return this.priorities.reduce((acc, p) => {
      acc[p] = Math.round((counts[p] / max) * 100);
      return acc;
    }, {} as Record<Priority, number>);
  });

  recentActivity = computed<ActivityRow[]>(() => {
    const rows: ActivityRow[] = [];
    this.scoped().forEach((t) => {
      t.activity.forEach((a) => {
        rows.push({ ticketId: t.id, ticketTitle: t.title, name: a.name, role: a.role, message: a.message, at: a.at });
      });
    });
    return rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
  });

  companyBreakdown = computed(() => {
    const u = this.user();
    if (u?.role !== 'superadmin') return [];
    const companies = this.stateService.state().companies;
    const tickets = this.scoped();
    const counted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      count: tickets.filter((t) => t.companyId === c.id).length,
    }));
    const max = Math.max(1, ...counted.map((c) => c.count));
    return counted
      .map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }))
      .sort((a, b) => b.count - a.count);
  });

  timeAgo(at: string): string {
    const diffMs = Date.now() - new Date(at).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}

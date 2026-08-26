import { Component, computed, inject } from '@angular/core';
import { StateService } from '../../services/state.service';
import { formatDate } from '../../util/format';

interface CompanyRow {
  id: string;
  name: string;
  industry: string;
  size: string;
  admins: number;
  ticketCount: number;
  open: number;
  createdAt: string;
}

@Component({
  selector: 'app-companies-page',
  standalone: true,
  template: `
    <section class="panel">
      <div class="panel-head">
        <h2>Registered companies</h2>
        <span class="count-badge">{{ rows().length }}</span>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Admins</th>
              <th>Tickets</th>
              <th>Open</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id) {
              <tr>
                <td class="name-cell">{{ row.name }}</td>
                <td>{{ row.industry }}</td>
                <td>{{ row.size }}</td>
                <td class="num">{{ row.admins }}</td>
                <td class="num">{{ row.ticketCount }}</td>
                <td class="num">{{ row.open }}</td>
                <td>{{ formatDate(row.createdAt) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class CompaniesPageComponent {
  private stateService = inject(StateService);
  formatDate = formatDate;

  rows = computed<CompanyRow[]>(() => {
    const s = this.stateService.state();
    return [...s.companies]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => {
        const tickets = s.tickets.filter((t) => t.companyId === c.id);
        const admins = s.users.filter((u) => u.companyId === c.id).length;
        const open = tickets.filter((t) => t.status === 'Open').length;
        return {
          id: c.id,
          name: c.name,
          industry: c.industry,
          size: c.size,
          admins,
          ticketCount: tickets.length,
          open,
          createdAt: c.createdAt,
        };
      });
  });
}

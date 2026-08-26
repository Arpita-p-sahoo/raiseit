import { Injectable, signal } from '@angular/core';
import { defaultFilters, Filters } from '../models/models';

export type Route = 'dashboard' | 'company' | 'companies' | 'users' | 'liveGraph' | 'settings';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly route = signal<Route>('dashboard');
  readonly filters = signal<Filters>(defaultFilters());
  readonly expandedTickets = signal<Record<string, boolean>>({});

  setRoute(route: Route): void {
    this.route.set(route);
  }

  setFilter(key: keyof Filters, value: string): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  toggleTicket(id: string): void {
    this.expandedTickets.update((exp) => ({ ...exp, [id]: !exp[id] }));
  }

  expandTicket(id: string): void {
    this.expandedTickets.update((exp) => ({ ...exp, [id]: true }));
  }

  resetForNewSession(): void {
    this.route.set('dashboard');
    this.filters.set(defaultFilters());
  }
}

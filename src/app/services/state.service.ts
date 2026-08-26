import { Injectable, signal } from '@angular/core';
import { AppState, Company, Priority, Ticket, User } from '../models/models';

const STORAGE_KEY = 'raiseit_state_v3';

function seedState(): AppState {
  const now = Date.now();
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;

  const companies: Company[] = [
    { id: 'C1', name: 'Nimbus Cloud', industry: 'Software & Technology', size: '51-200', createdAt: iso(200 * DAY) },
    { id: 'C2', name: 'Alta Freight Co.', industry: 'Logistics & Transportation', size: '201-1,000', createdAt: iso(340 * DAY) },
    { id: 'C3', name: 'Brightline Retail', industry: 'Retail & Ecommerce', size: '11-50', createdAt: iso(90 * DAY) },
  ];

  const users: User[] = [
    { id: 'U1', name: 'Ava Reyes', email: 'ava@raiseit.io', password: 'superadmin', role: 'superadmin', companyId: null, notify: true, createdAt: iso(400 * DAY) },
    { id: 'U2', name: 'Tomas Rivera', email: 'tomas@nimbuscloud.io', password: 'demo1234', role: 'admin', companyId: 'C1', notify: true, createdAt: iso(200 * DAY) },
    { id: 'U3', name: 'Marcus Webb', email: 'marcus@altafreight.io', password: 'demo1234', role: 'admin', companyId: 'C2', notify: true, createdAt: iso(340 * DAY) },
    { id: 'U4', name: 'Aisha Khan', email: 'aisha@brightlineretail.io', password: 'demo1234', role: 'admin', companyId: 'C3', notify: true, createdAt: iso(90 * DAY) },
    { id: 'U5', name: 'Priya Nair', email: 'priya@example.com', password: 'demo1234', role: 'customer', companyId: null, notify: true, createdAt: iso(30 * DAY) },
    { id: 'U6', name: 'Devon Marsh', email: 'devon@example.com', password: 'demo1234', role: 'customer', companyId: null, notify: true, createdAt: iso(60 * DAY) },
    { id: 'U7', name: 'Sana Iqbal', email: 'sana@example.com', password: 'demo1234', role: 'customer', companyId: null, notify: true, createdAt: iso(20 * DAY) },
  ];

  const tickets: Ticket[] = [
    {
      id: 'RT-2405', companyId: 'C2', title: 'Add bulk CSV import for shipment manifests',
      raisedById: 'U6', raisedByName: 'Devon Marsh', priority: 'Medium', status: 'Closed', createdAt: iso(12 * DAY), updatedAt: iso(9 * DAY),
      activity: [
        { userId: 'U6', name: 'Devon Marsh', role: 'customer', message: 'It would save us hours each week if we could bulk-upload manifests instead of entering them one by one.', at: iso(12 * DAY) },
        { userId: 'U3', name: 'Marcus Webb', role: 'admin', message: 'Good call - added to the next release. A CSV template is now available in your account settings.', at: iso(10 * DAY) },
        { userId: 'U3', name: 'Marcus Webb', role: 'system', message: 'Status changed to Closed', at: iso(9 * DAY) },
      ],
    },
    {
      id: 'RT-2404', companyId: 'C3', title: 'Checkout page throws 502 during peak hours',
      raisedById: 'U7', raisedByName: 'Sana Iqbal', priority: 'Urgent', status: 'Resolved', createdAt: iso(5 * DAY), updatedAt: iso(1 * DAY),
      activity: [
        { userId: 'U7', name: 'Sana Iqbal', role: 'customer', message: 'Every day around 6pm checkout starts failing with a 502. We are losing sales during our busiest window.', at: iso(5 * DAY) },
        { userId: 'U4', name: 'Aisha Khan', role: 'admin', message: 'Traced it to a connection pool limit under load. Scaled the pool and redeployed.', at: iso(2 * DAY) },
        { userId: 'U4', name: 'Aisha Khan', role: 'system', message: 'Status changed to Resolved', at: iso(1 * DAY) },
      ],
    },
    {
      id: 'RT-2401', companyId: 'C1', title: 'Dashboard fails to load past 500 records',
      raisedById: 'U5', raisedByName: 'Priya Nair', priority: 'High', status: 'In Progress', createdAt: iso(2 * DAY), updatedAt: iso(3 * HOUR),
      activity: [
        { userId: 'U5', name: 'Priya Nair', role: 'customer', message: 'Any account with more than about 500 rows just shows a blank dashboard. Console shows a timeout.', at: iso(2 * DAY) },
        { userId: 'U2', name: 'Tomas Rivera', role: 'admin', message: 'Reproduced it - pagination is not kicking in correctly. Fix is in progress.', at: iso(3 * HOUR) },
      ],
    },
    {
      id: 'RT-2402', companyId: 'C1', title: 'Export button missing on invoices tab',
      raisedById: 'U5', raisedByName: 'Priya Nair', priority: 'Low', status: 'Open', createdAt: iso(6 * HOUR), updatedAt: iso(6 * HOUR),
      activity: [
        { userId: 'U5', name: 'Priya Nair', role: 'customer', message: 'The CSV export button that used to be on the invoices tab is no longer there.', at: iso(6 * HOUR) },
      ],
    },
    {
      id: 'RT-2403', companyId: 'C2', title: 'Tracking API returns stale coordinates',
      raisedById: 'U6', raisedByName: 'Devon Marsh', priority: 'Urgent', status: 'Open', createdAt: iso(40 * MIN), updatedAt: iso(40 * MIN),
      activity: [
        { userId: 'U6', name: 'Devon Marsh', role: 'customer', message: 'Live tracking is showing driver positions from over an hour ago. Dispatch is flying blind right now.', at: iso(40 * MIN) },
      ],
    },
    {
      id: 'RT-2406', companyId: 'C1', title: 'Search results ignore date range filter',
      raisedById: 'U5', raisedByName: 'Priya Nair', priority: 'High', status: 'Open', createdAt: iso(23 * HOUR), updatedAt: iso(23 * HOUR),
      activity: [
        { userId: 'U5', name: 'Priya Nair', role: 'customer', message: 'Setting a custom date range on search still returns results from outside that window.', at: iso(23 * HOUR) },
      ],
    },
    {
      id: 'RT-2407', companyId: 'C2', title: 'Invoice PDF missing line-item tax breakdown',
      raisedById: 'U6', raisedByName: 'Devon Marsh', priority: 'Medium', status: 'In Progress', createdAt: iso(20 * HOUR), updatedAt: iso(6 * HOUR),
      activity: [
        { userId: 'U6', name: 'Devon Marsh', role: 'customer', message: 'Our accounting team needs the per-line tax shown on the generated PDF, not just the total.', at: iso(20 * HOUR) },
        { userId: 'U3', name: 'Marcus Webb', role: 'admin', message: 'Makes sense - reworking the invoice template now.', at: iso(6 * HOUR) },
      ],
    },
    {
      id: 'RT-2408', companyId: 'C3', title: 'Product images load blurry on mobile',
      raisedById: 'U7', raisedByName: 'Sana Iqbal', priority: 'Low', status: 'Resolved', createdAt: iso(17 * HOUR), updatedAt: iso(4 * HOUR),
      activity: [
        { userId: 'U7', name: 'Sana Iqbal', role: 'customer', message: 'Product listing thumbnails look pixelated on phones, even on a fast connection.', at: iso(17 * HOUR) },
        { userId: 'U4', name: 'Aisha Khan', role: 'admin', message: 'The mobile breakpoint was serving the low-res image variant by mistake. Fixed.', at: iso(4 * HOUR) },
        { userId: 'U4', name: 'Aisha Khan', role: 'system', message: 'Status changed to Resolved', at: iso(4 * HOUR) },
      ],
    },
    {
      id: 'RT-2409', companyId: 'C1', title: 'SSO login redirect loop for enterprise tenants',
      raisedById: 'U5', raisedByName: 'Priya Nair', priority: 'Urgent', status: 'Open', createdAt: iso(15 * HOUR), updatedAt: iso(15 * HOUR),
      activity: [
        { userId: 'U5', name: 'Priya Nair', role: 'customer', message: 'A subset of our SSO users get bounced in a redirect loop and can never reach the dashboard.', at: iso(15 * HOUR) },
      ],
    },
    {
      id: 'RT-2410', companyId: 'C2', title: 'Driver app crashes when scanning damaged barcodes',
      raisedById: 'U6', raisedByName: 'Devon Marsh', priority: 'Medium', status: 'Closed', createdAt: iso(11 * HOUR), updatedAt: iso(2 * HOUR),
      activity: [
        { userId: 'U6', name: 'Devon Marsh', role: 'customer', message: 'Any time a driver scans a torn or smudged barcode label, the app force-closes.', at: iso(11 * HOUR) },
        { userId: 'U3', name: 'Marcus Webb', role: 'admin', message: 'Added a fallback to manual entry when the scan fails instead of crashing. Shipped in the latest build.', at: iso(2 * HOUR) },
        { userId: 'U3', name: 'Marcus Webb', role: 'system', message: 'Status changed to Closed', at: iso(2 * HOUR) },
      ],
    },
    {
      id: 'RT-2411', companyId: 'C3', title: 'Cart totals mismatch after coupon stacking',
      raisedById: 'U7', raisedByName: 'Sana Iqbal', priority: 'High', status: 'In Progress', createdAt: iso(8 * HOUR), updatedAt: iso(1 * HOUR),
      activity: [
        { userId: 'U7', name: 'Sana Iqbal', role: 'customer', message: 'Applying two coupons in the same order shows a cart total that does not match what gets charged.', at: iso(8 * HOUR) },
        { userId: 'U4', name: 'Aisha Khan', role: 'admin', message: 'Confirmed - the second discount is applying to the pre-discount subtotal. Working on a fix.', at: iso(1 * HOUR) },
      ],
    },
    {
      id: 'RT-2412', companyId: 'C1', title: 'Settings page tab order is broken for keyboard nav',
      raisedById: 'U5', raisedByName: 'Priya Nair', priority: 'Low', status: 'Open', createdAt: iso(4 * HOUR), updatedAt: iso(4 * HOUR),
      activity: [
        { userId: 'U5', name: 'Priya Nair', role: 'customer', message: 'Tabbing through the settings form jumps around instead of moving top to bottom.', at: iso(4 * HOUR) },
      ],
    },
    {
      id: 'RT-2413', companyId: 'C3', title: 'Payment webhook retries are duplicating orders',
      raisedById: 'U7', raisedByName: 'Sana Iqbal', priority: 'Urgent', status: 'Open', createdAt: iso(25 * MIN), updatedAt: iso(25 * MIN),
      activity: [
        { userId: 'U7', name: 'Sana Iqbal', role: 'customer', message: 'We are seeing duplicate orders created whenever the payment provider retries a webhook after a timeout.', at: iso(25 * MIN) },
      ],
    },
  ];

  // Extra tickets clustered onto the same hours as the ones above, so the
  // live-graph area chart shows tall, clearly color-coded peaks instead of a
  // flat trickle of single-ticket bumps.
  const RAISERS: Record<string, { id: string; name: string }> = {
    C1: { id: 'U5', name: 'Priya Nair' },
    C2: { id: 'U6', name: 'Devon Marsh' },
    C3: { id: 'U7', name: 'Sana Iqbal' },
  };
  const filler: { hours?: number; mins?: number; companyId: string; priority: Priority; title: string; message: string }[] = [
    { hours: 23, companyId: 'C2', priority: 'Urgent', title: 'Payment gateway rejecting all Visa cards', message: 'Every Visa transaction has failed for the last hour straight - this is blocking checkout entirely.' },
    { hours: 23, companyId: 'C3', priority: 'Urgent', title: 'API rate limit hit during nightly sync', message: 'Our nightly sync job is getting 429s from your API and the whole batch is failing.' },
    { hours: 20, companyId: 'C3', priority: 'High', title: 'Bulk export times out over 2000 rows', message: 'Exporting anything past 2000 rows just spins forever and eventually times out.' },
    { hours: 17, companyId: 'C1', priority: 'Medium', title: 'Notification bell shows wrong unread count', message: 'The bell badge says 6 unread but the notification panel is empty.' },
    { hours: 17, companyId: 'C2', priority: 'Medium', title: 'CSV import skips rows with unicode characters', message: 'Rows with accented names silently disappear during import, no error shown.' },
    { hours: 15, companyId: 'C2', priority: 'Urgent', title: 'Fleet map goes blank for all dispatchers', message: 'The live fleet map has been a blank white screen for every dispatcher since this morning.' },
    { hours: 15, companyId: 'C3', priority: 'High', title: 'Refunds stuck in pending for 48 hours', message: 'Several customer refunds have been stuck in pending status for two days now.' },
    { hours: 11, companyId: 'C1', priority: 'Medium', title: 'Report scheduler sends duplicate emails', message: 'The weekly report is emailing every recipient twice.' },
    { hours: 11, companyId: 'C3', priority: 'Low', title: 'Footer link to help center is broken', message: 'The "Help Center" link in the footer 404s.' },
    { hours: 8, companyId: 'C1', priority: 'High', title: 'API keys page fails to load for new admins', message: 'Newly invited admins get a blank screen when they open the API keys page.' },
    { hours: 8, companyId: 'C2', priority: 'Urgent', title: 'Warehouse scanner app cannot sign in', message: 'Every scanner in the east warehouse is stuck on the sign-in screen since the last update.' },
    { hours: 6, companyId: 'C2', priority: 'Low', title: 'Dark mode toggle resets on page reload', message: 'Dark mode turns itself back off every time I refresh the page.' },
    { hours: 6, companyId: 'C3', priority: 'Medium', title: 'Order timeline shows times in the wrong timezone', message: 'All order timestamps are showing UTC instead of our store timezone.' },
    { hours: 4, companyId: 'C2', priority: 'Urgent', title: 'Duplicate charge on customer credit cards', message: 'A batch of customers were charged twice for the same order this afternoon.' },
    { hours: 4, companyId: 'C3', priority: 'Urgent', title: 'Site-wide search returns zero results', message: 'Search has returned zero results for every query for the past 30 minutes.' },
    { hours: 2, companyId: 'C1', priority: 'High', title: 'Bulk status update fails silently past 50 tickets', message: 'Selecting more than 50 tickets and bulk-updating status just does nothing, no error.' },
    { hours: 2, companyId: 'C2', priority: 'High', title: 'Driver app GPS drifts several blocks off', message: 'Driver positions on the map are consistently several blocks off from their real location.' },
    { hours: 2, companyId: 'C3', priority: 'Medium', title: 'Gift card balance not reflected at checkout', message: 'Applying a gift card shows the correct balance but does not deduct it at checkout.' },
    { hours: 1, companyId: 'C1', priority: 'Urgent', title: 'Login page returns 500 for all users', message: 'Nobody on our team can sign in right now - the login page just shows a server error.' },
    { hours: 1, companyId: 'C2', priority: 'High', title: 'Route optimizer ignores driver availability', message: 'The route optimizer keeps assigning stops to drivers who are marked unavailable.' },
    { mins: 40, companyId: 'C3', priority: 'Urgent', title: 'Inventory sync overwrote today\'s stock counts', message: 'This morning\'s manual stock adjustments were wiped out by the sync job.' },
    { mins: 10, companyId: 'C1', priority: 'Urgent', title: 'Site-wide outage - 500 errors on every page', message: 'The entire app is down for us right now, every page returns a server error.' },
    { mins: 5, companyId: 'C2', priority: 'High', title: 'Dashboard widget stuck on loading spinner', message: 'The revenue widget on the dashboard has been spinning for ten minutes and never loads.' },
  ];

  filler.forEach((f, i) => {
    const ageMs = f.hours != null ? f.hours * HOUR : (f.mins ?? 0) * MIN;
    const raiser = RAISERS[f.companyId];
    tickets.push({
      id: `RT-24${14 + i}`,
      companyId: f.companyId,
      title: f.title,
      raisedById: raiser.id,
      raisedByName: raiser.name,
      priority: f.priority,
      status: 'Open',
      createdAt: iso(ageMs),
      updatedAt: iso(ageMs),
      activity: [{ userId: raiser.id, name: raiser.name, role: 'customer', message: f.message, at: iso(ageMs) }],
    });
  });

  return { nextTicketId: 2414 + filler.length, nextCompanyId: 4, nextUserId: 8, companies, users, tickets };
}

@Injectable({ providedIn: 'root' })
export class StateService {
  readonly state = signal<AppState>(this.loadState());

  private loadState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore corrupt storage */
    }
    const s = seedState();
    this.persist(s);
    return s;
  }

  private persist(s: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  private commit(next: AppState): void {
    this.persist(next);
    this.state.set(next);
  }

  resyncFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.state.set(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
  }

  companyById(id: string | null): Company | null {
    if (!id) return null;
    return this.state().companies.find((c) => c.id === id) ?? null;
  }

  ticketById(id: string): Ticket | null {
    return this.state().tickets.find((t) => t.id === id) ?? null;
  }

  findUserByEmail(email: string): User | null {
    const e = email.trim().toLowerCase();
    return this.state().users.find((u) => u.email.toLowerCase() === e) ?? null;
  }

  findUserById(id: string): User | null {
    return this.state().users.find((u) => u.id === id) ?? null;
  }

  registerCustomer(name: string, email: string, password: string): { user?: User; error?: string } {
    if (this.findUserByEmail(email)) return { error: 'An account with this email already exists.' };
    const s = this.state();
    const user: User = {
      id: 'U' + s.nextUserId, name: name.trim(), email: email.trim(), password,
      role: 'customer', companyId: null, notify: true, createdAt: new Date().toISOString(),
    };
    this.commit({ ...s, nextUserId: s.nextUserId + 1, users: [...s.users, user] });
    return { user };
  }

  registerCompany(name: string, email: string, password: string, companyName: string, industry: string, size: string): { user?: User; error?: string } {
    if (this.findUserByEmail(email)) return { error: 'An account with this email already exists.' };
    const s = this.state();
    const dup = s.companies.find((c) => c.name.toLowerCase() === companyName.trim().toLowerCase());
    if (dup) return { error: 'A company with this name is already registered.' };
    const company: Company = { id: 'C' + s.nextCompanyId, name: companyName.trim(), industry, size, createdAt: new Date().toISOString() };
    const user: User = {
      id: 'U' + s.nextUserId, name: name.trim(), email: email.trim(), password,
      role: 'admin', companyId: company.id, notify: true, createdAt: new Date().toISOString(),
    };
    this.commit({
      ...s,
      nextCompanyId: s.nextCompanyId + 1,
      nextUserId: s.nextUserId + 1,
      companies: [...s.companies, company],
      users: [...s.users, user],
    });
    return { user };
  }

  raiseTicket(companyId: string, title: string, description: string, priority: Ticket['priority'], currentUser: User): Ticket {
    const s = this.state();
    const id = 'RT-' + s.nextTicketId;
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id, companyId, title: title.trim(),
      raisedById: currentUser.id, raisedByName: currentUser.name, priority, status: 'Open',
      createdAt: now, updatedAt: now,
      activity: [{ userId: currentUser.id, name: currentUser.name, role: 'customer', message: description.trim(), at: now }],
    };
    this.commit({ ...s, nextTicketId: s.nextTicketId + 1, tickets: [ticket, ...s.tickets] });
    return ticket;
  }

  addActivity(ticketId: string, message: string, role: Ticket['activity'][number]['role'], currentUser: User): void {
    if (!message.trim()) return;
    const s = this.state();
    const now = new Date().toISOString();
    const tickets = s.tickets.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        updatedAt: now,
        activity: [...t.activity, { userId: currentUser.id, name: currentUser.name, role, message: message.trim(), at: now }],
      };
    });
    this.commit({ ...s, tickets });
  }

  setStatus(ticketId: string, status: Ticket['status'], currentUser: User): void {
    const s = this.state();
    const now = new Date().toISOString();
    const tickets = s.tickets.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status,
        updatedAt: now,
        activity: [...t.activity, { userId: currentUser.id, name: currentUser.name, role: 'system' as const, message: 'Status changed to ' + status, at: now }],
      };
    });
    this.commit({ ...s, tickets });
  }

  inviteTeammate(name: string, email: string, currentUser: User): { user?: User; tempPassword?: string; error?: string } {
    if (this.findUserByEmail(email)) return { error: 'That email is already registered.' };
    const s = this.state();
    const tempPassword = 'welcome' + Math.floor(100 + Math.random() * 900);
    const user: User = {
      id: 'U' + s.nextUserId, name: name.trim(), email: email.trim(), password: tempPassword,
      role: 'admin', companyId: currentUser.companyId, notify: true, createdAt: new Date().toISOString(),
    };
    this.commit({ ...s, nextUserId: s.nextUserId + 1, users: [...s.users, user] });
    return { user, tempPassword };
  }

  inviteSuperAdmin(name: string, email: string): { user?: User; tempPassword?: string; error?: string } {
    if (this.findUserByEmail(email)) return { error: 'That email is already registered.' };
    const s = this.state();
    const tempPassword = 'raise' + Math.floor(1000 + Math.random() * 9000);
    const user: User = {
      id: 'U' + s.nextUserId, name: name.trim(), email: email.trim(), password: tempPassword,
      role: 'superadmin', companyId: null, notify: true, createdAt: new Date().toISOString(),
    };
    this.commit({ ...s, nextUserId: s.nextUserId + 1, users: [...s.users, user] });
    return { user, tempPassword };
  }

  updateCompanyProfile(companyId: string, name: string, industry: string, size: string): { company?: Company; error?: string } {
    const s = this.state();
    const dup = s.companies.find((c) => c.id !== companyId && c.name.toLowerCase() === name.trim().toLowerCase());
    if (dup) return { error: 'A company with this name is already registered.' };
    let updated: Company | undefined;
    const companies = s.companies.map((c) => {
      if (c.id !== companyId) return c;
      updated = { ...c, name: name.trim(), industry, size };
      return updated;
    });
    this.commit({ ...s, companies });
    return { company: updated };
  }

  updateProfile(currentUser: User, name: string, email: string, notify: boolean): { user?: User; error?: string } {
    const dup = this.findUserByEmail(email);
    if (dup && dup.id !== currentUser.id) return { error: 'That email is already in use.' };
    const s = this.state();
    let updated: User | undefined;
    const users = s.users.map((u) => {
      if (u.id !== currentUser.id) return u;
      updated = { ...u, name: name.trim(), email: email.trim(), notify };
      return updated;
    });
    this.commit({ ...s, users });
    return { user: updated };
  }
}

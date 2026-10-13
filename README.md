# RaiseIt

**One place to raise, track, and resolve support tickets across customers, companies, and the people who oversee them.**

RaiseIt is a multi-tenant support ticketing web app. Customers raise tickets with any registered company, company teams work through them, and a platform-level superadmin can see everything across every workspace, all from one shared, role-aware interface.

---

## The idea

Most support tools are built for a single company talking to its own customers. That leaves gaps:

- **Customers** juggle a different portal, inbox, or email thread for every vendor they deal with.
- **Small and growing companies** need a ticket queue but don't want the cost and setup of an enterprise helpdesk.
- **Platform operators** (marketplaces, agencies, IT providers, holding groups) have no single view of support health across all the businesses they look after.

RaiseIt puts all three parties in one system:

1. **Raise:** a customer picks a company, describes the issue, and sets a priority (Low, Medium, High, Urgent).
2. **Track:** every ticket has a status (Open → In Progress → Resolved → Closed) and an activity log of every reply and status change, with the author's name and role on each entry.
3. **Resolve:** company admins reply and move tickets forward, and superadmins watch volume, priority, and activity across every company in real time on the **Live Graph**.

The aim is to make support **transparent for customers, lightweight for companies, and observable for whoever is accountable for the whole platform.**

---

## Who it's for

| Audience | Role in the app | What they get |
| --- | --- | --- |
| **Customers / end users** | `customer` | One account to raise tickets with any registered company, and one dashboard showing the status and full history of every ticket they've raised. |
| **Small & mid-sized businesses** (1 to 1,000+ people, across software, logistics, retail, finance, healthcare, manufacturing, and more) | `admin` | A company workspace in minutes: a ticket queue filtered by status and priority, replies and status updates, teammate invites, and a live view of their own support load. |
| **Platform operators / oversight teams** (marketplaces, MSPs and IT service providers, agencies, franchise or holding groups) | `superadmin` | A cross-company view of every ticket, company, and user; filtering by company, status, priority, and role; and a Live Graph of ticket volume by priority and by company, plus a recent-activity feed. |

### Good fits

- A **marketplace or SaaS platform** that hosts many vendors and wants one support layer across all of them.
- An **IT services provider / MSP** handling requests from several client companies.
- A **startup or small team** that needs a clean ticket queue today without enterprise helpdesk overhead.
- **Students and developers** looking for a reference Angular app with role-based UI, signals-based state, and dashboards.

---

## Features

- **Role-based experience:** each role gets its own dashboard and navigation:
  - Customer: *Dashboard, Settings*
  - Admin: *Dashboard, Company, Live Graph, Settings*
  - Superadmin: *Dashboard, Companies, Users, Live Graph, Settings*
- **Self-serve onboarding:** register as a customer, or register a company with its name, industry, and size.
- **Ticket lifecycle:** priorities, statuses, threaded replies, and a full activity history per ticket.
- **Team management:** admins invite teammates and superadmins invite other superadmins (a temporary password is generated).
- **Live Graph:** ticket breakdown by priority and by company, with a recent-activity stream.
- **Filtering:** by status, priority, company, and role.
- **Settings:** profile, notification preference, and light/dark appearance.
- **Live sync:** state re-syncs across open browser tabs automatically.
- **Responsive layout:** collapsible sidebar menu on small screens.

---

## Try it with demo accounts

The app ships with seeded demo data. Sign in with any of these:

| Role | Email | Password |
| --- | --- | --- |
| Superadmin | `ava@raiseit.io` | `superadmin` |
| Admin (Nimbus Cloud) | `tomas@nimbuscloud.io` | `demo1234` |
| Admin (Alta Freight) | `marcus@altafreight.io` | `demo1234` |
| Admin (Brightline Retail) | `aisha@brightlineretail.io` | `demo1234` |
| Customer | `priya@example.com` | `demo1234` |

Open two browser tabs as different roles (for example a customer and that company's admin) to watch a ticket move through its lifecycle.

> **Note:** This is currently a front-end prototype. All data, including passwords, is stored in the browser's `localStorage`; there is no backend or real authentication yet. Don't use real credentials.

---

## Tech stack

- [Angular 18](https://angular.dev) (standalone components, signals, new control flow)
- TypeScript 5.5
- RxJS
- Plain CSS with light and dark themes
- Karma + Jasmine for unit tests

## Project structure

```
src/app/
├── components/
│   ├── auth/            # Sign-in and registration (customer / company)
│   ├── dashboard/       # Customer, admin, and superadmin dashboards
│   ├── company/         # Company workspace page (admin)
│   ├── companies/       # All companies (superadmin)
│   ├── users/           # All users (superadmin)
│   ├── live-graph/      # Live Graph page and charts
│   ├── settings/        # Profile, notifications, appearance
│   ├── shell/           # App shell and role-aware sidebar
│   └── ...              # Shared UI: ticket-card, stat-tiles, avatar, toast, empty-state
├── models/              # Roles, statuses, priorities, and domain types
├── services/            # Auth, app state (localStorage), theme, toast, UI state
└── util/                # Formatting helpers
```

---

## Getting started

**Prerequisites:** Node.js 18.19+ and npm.

```bash
npm install
npm start          # runs ng serve
```

Then open <http://localhost:4200/>.

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Rebuild on change (development configuration) |
| `npm test` | Run unit tests with Karma |

To reset the demo data, clear the site's `localStorage` in your browser dev tools.

---

## Roadmap ideas

- Backend API and persistent database
- Real authentication (hashed passwords, sessions/JWT, SSO)
- Email notifications for ticket updates
- Attachments, SLAs, and ticket assignment to specific agents
- Analytics over time (resolution time, backlog trends)

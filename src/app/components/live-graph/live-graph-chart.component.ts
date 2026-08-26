import { Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { PRIORITIES, Priority, Ticket } from '../../models/models';
import { UiStateService } from '../../services/ui-state.service';

const TICK_MS = 4000;
const BUCKET_HOURS = 24;
const HOUR = 3600000;

const PRIORITY_COLOR: Record<Priority, string> = {
  Low: 'var(--p-low)',
  Medium: 'var(--p-medium)',
  High: 'var(--p-high)',
  Urgent: 'var(--p-urgent)',
};
const NEUTRAL_COLOR = 'var(--muted)';
const SEVERITY_ORDER: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

interface Point {
  x: number;
  y: number;
}

interface Bucket {
  label: string;
  value: number;
  priorityCounts: Record<Priority, number>;
}

interface GradientStop {
  offset: number;
  color: string;
}

const CHART_W = 640;
const CHART_H = 200;
const CHART_PAD = 12;

function dominantColor(counts: Record<Priority, number>): string {
  let best: Priority | null = null;
  let bestCount = 0;
  for (const p of SEVERITY_ORDER) {
    if (counts[p] > bestCount) {
      bestCount = counts[p];
      best = p;
    }
  }
  return best ? PRIORITY_COLOR[best] : NEUTRAL_COLOR;
}

function smoothPath(points: Point[]): string {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

@Component({
  selector: 'app-live-graph-chart',
  standalone: true,
  template: `
    <section class="panel live-graph-panel">
      <div class="panel-head">
        <div>
          <h2>Ticket volume · last 24h</h2>
          <p class="panel-sub">{{ scopeLabel() }} · color shows severity · hover a point for details</p>
        </div>
        <div class="live-graph-panel-actions">
          <div class="page-header-meta"><span class="live-dot"></span>Live · {{ lastUpdatedLabel() }}</div>
          @if (showMaximize()) {
            <button type="button" class="icon-btn" aria-label="Open full live graph" title="Open full live graph" (click)="maximize()">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M7.5 3H3v4.5M12.5 3H17v4.5M7.5 17H3v-4.5M12.5 17H17v-4.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          }
        </div>
      </div>
      <div class="live-chart-wrap">
        <svg [attr.viewBox]="'0 0 ' + chartW + ' ' + chartH" preserveAspectRatio="none" class="live-chart">
          <defs>
            <linearGradient [attr.id]="lineGradId" gradientUnits="userSpaceOnUse" [attr.x1]="chartPad" [attr.x2]="chartW - chartPad" y1="0" y2="0">
              @for (s of gradientStops(); track $index) {
                <stop [attr.offset]="s.offset + '%'" [attr.stop-color]="s.color" />
              }
            </linearGradient>
            <linearGradient [attr.id]="fadeGradId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fff" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#fff" stop-opacity="0" />
            </linearGradient>
            <mask [attr.id]="fadeMaskId">
              <rect x="0" y="0" [attr.width]="chartW" [attr.height]="chartH" [attr.fill]="'url(#' + fadeGradId + ')'" />
            </mask>
          </defs>
          @for (gy of gridLines; track gy) {
            <line [attr.x1]="chartPad" [attr.x2]="chartW - chartPad" [attr.y1]="gy" [attr.y2]="gy" class="live-chart-grid" />
          }
          <path [attr.d]="areaPath()" [attr.fill]="'url(#' + lineGradId + ')'" stroke="none" [attr.mask]="'url(#' + fadeMaskId + ')'" />
          <path
            [attr.d]="linePath()"
            fill="none"
            [attr.stroke]="'url(#' + lineGradId + ')'"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          @if (hoveredIndex(); as hi) {
            <line
              [attr.x1]="points()[hi].x"
              [attr.x2]="points()[hi].x"
              [attr.y1]="chartPad"
              [attr.y2]="chartH - chartPad"
              class="live-chart-guide"
            />
          }
          @for (p of points(); track $index) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="hoveredIndex() === $index ? 5 : 3" class="live-chart-dot" [class.live-chart-dot--active]="hoveredIndex() === $index" />
          }
          @for (p of points(); track $index; let i = $index) {
            <rect
              [attr.x]="hitRects()[i].x"
              y="0"
              [attr.width]="hitRects()[i].w"
              [attr.height]="chartH"
              fill="transparent"
              (mouseenter)="hoveredIndex.set(i)"
              (mouseleave)="hoveredIndex.set(null)"
            />
          }
        </svg>
        @if (hoveredIndex(); as hi) {
          <div class="live-chart-tooltip" [style.left.%]="tooltipLeftPct(hi)" [style.top.%]="tooltipTopPct(hi)">
            <div class="live-chart-tooltip-title">{{ hourly()[hi].label }}</div>
            <div class="live-chart-tooltip-total">{{ hourly()[hi].value }} total</div>
            <div class="live-chart-tooltip-rows">
              @for (p of priorities; track p) {
                <div class="live-chart-tooltip-row">
                  <span class="live-chart-tooltip-dot" [style.background]="priorityColor(p)"></span>
                  <span class="live-chart-tooltip-label">{{ p }}</span>
                  <span class="live-chart-tooltip-val">{{ hourly()[hi].priorityCounts[p] }}</span>
                </div>
              }
            </div>
          </div>
        }
        <div class="live-chart-axis">
          @for (h of hourly(); track $index) {
            @if ($index % 4 === 0) {
              <span>{{ h.label }}</span>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class LiveGraphChartComponent implements OnInit, OnDestroy {
  private ui = inject(UiStateService);
  private static instanceCount = 0;
  private instanceId = LiveGraphChartComponent.instanceCount++;

  tickets = input.required<Ticket[]>();
  scopeLabel = input<string>('');
  showMaximize = input<boolean>(true);

  priorities = PRIORITIES;
  chartW = CHART_W;
  chartH = CHART_H;
  chartPad = CHART_PAD;
  gridLines = [CHART_PAD, CHART_H / 2, CHART_H - CHART_PAD];

  lineGradId = `liveLineGrad-${this.instanceId}`;
  fadeGradId = `liveFadeGrad-${this.instanceId}`;
  fadeMaskId = `liveFadeMask-${this.instanceId}`;

  hoveredIndex = signal<number | null>(null);

  private now = signal(Date.now());
  private tickHandle?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.tickHandle = setInterval(() => this.now.set(Date.now()), TICK_MS);
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  maximize(): void {
    this.ui.setRoute('liveGraph');
  }

  lastUpdatedLabel = computed(() => {
    const d = new Date(this.now());
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  hourly = computed<Bucket[]>(() => {
    const nowVal = this.now();
    const tickets = this.tickets();
    const buckets: Bucket[] = [];
    for (let i = BUCKET_HOURS - 1; i >= 0; i--) {
      const bucketStart = nowVal - i * HOUR;
      const bucketEnd = bucketStart + HOUR;
      const inBucket = tickets.filter((t) => {
        const created = new Date(t.createdAt).getTime();
        return created >= bucketStart && created < bucketEnd;
      });
      const priorityCounts: Record<Priority, number> = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
      inBucket.forEach((t) => (priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1));
      buckets.push({ label: new Date(bucketStart).getHours() + ':00', value: inBucket.length, priorityCounts });
    }
    return buckets;
  });

  points = computed<Point[]>(() => {
    const data = this.hourly();
    const max = Math.max(1, ...data.map((d) => d.value));
    const innerW = this.chartW - this.chartPad * 2;
    const innerH = this.chartH - this.chartPad * 2;
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    return data.map((d, i) => ({
      x: this.chartPad + i * stepX,
      y: this.chartH - this.chartPad - (d.value / max) * innerH,
    }));
  });

  hitRects = computed(() => {
    const pts = this.points();
    const step = pts.length > 1 ? pts[1].x - pts[0].x : this.chartW;
    return pts.map((p) => ({
      x: Math.max(0, p.x - step / 2),
      w: step,
    }));
  });

  gradientStops = computed<GradientStop[]>(() => {
    const pts = this.points();
    const data = this.hourly();
    const innerW = this.chartW - this.chartPad * 2;
    return data.map((d, i) => ({
      offset: innerW > 0 ? Math.max(0, Math.min(100, ((pts[i].x - this.chartPad) / innerW) * 100)) : 0,
      color: dominantColor(d.priorityCounts),
    }));
  });

  linePath = computed(() => smoothPath(this.points()));

  areaPath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    const baseline = this.chartH - this.chartPad;
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${smoothPath(pts)} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`;
  });

  tooltipLeftPct(i: number): number {
    const pts = this.points();
    const pct = (pts[i].x / this.chartW) * 100;
    return Math.max(8, Math.min(92, pct));
  }

  tooltipTopPct(i: number): number {
    const pts = this.points();
    return (pts[i].y / this.chartH) * 100;
  }

  priorityColor(p: Priority): string {
    return PRIORITY_COLOR[p];
  }
}

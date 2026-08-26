import { Component, input } from '@angular/core';
import { Status } from '../../models/models';

@Component({
  selector: 'app-stat-tiles',
  standalone: true,
  template: `
    <section class="stat-row">
      <div class="stat-tile stat-tile--open">
        <span class="stat-value">{{ counts()['Open'] }}</span>
        <span class="stat-label">Open</span>
      </div>
      <div class="stat-tile stat-tile--progress">
        <span class="stat-value">{{ counts()['In Progress'] }}</span>
        <span class="stat-label">In Progress</span>
      </div>
      <div class="stat-tile stat-tile--resolved">
        <span class="stat-value">{{ counts()['Resolved'] }}</span>
        <span class="stat-label">Resolved</span>
      </div>
      <div class="stat-tile stat-tile--closed">
        <span class="stat-value">{{ counts()['Closed'] }}</span>
        <span class="stat-label">Closed</span>
      </div>
      <div class="stat-tile stat-tile--total">
        <span class="stat-value">{{ total() }}</span>
        <span class="stat-label">Total</span>
      </div>
    </section>
  `,
})
export class StatTilesComponent {
  counts = input.required<Record<Status, number>>();
  total = input.required<number>();
}

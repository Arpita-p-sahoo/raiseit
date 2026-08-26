import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <strong>{{ title() }}</strong>
      <span>{{ sub() }}</span>
    </div>
  `,
})
export class EmptyStateComponent {
  title = input.required<string>();
  sub = input.required<string>();
}

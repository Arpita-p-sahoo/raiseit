import { Component, input } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  template: `
    <div class="brand" [class.brand--sm]="size() === 'sm'" [class.brand--lg]="size() === 'lg'">
      <svg class="brand-mark" [attr.width]="markSize()" [attr.height]="markSize()" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M7 4.5 L18 7 L7 9.5 Z" fill="currentColor" />
      </svg>
      Raise<em>It</em>
    </div>
  `,
})
export class BrandComponent {
  size = input<'sm' | 'lg'>('sm');
  markSize = () => (this.size() === 'lg' ? 26 : 18);
}

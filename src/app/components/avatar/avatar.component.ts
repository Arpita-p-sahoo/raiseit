import { Component, computed, input } from '@angular/core';
import { initials } from '../../util/format';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<span
    class="avatar"
    [style.width.px]="size()"
    [style.height.px]="size()"
    [style.fontSize.px]="fontSize()"
    >{{ initialsText() }}</span
  >`,
})
export class AvatarComponent {
  name = input.required<string>();
  size = input<number>(32);

  fontSize = computed(() => Math.round(this.size() * 0.4));
  initialsText = computed(() => initials(this.name()));
}

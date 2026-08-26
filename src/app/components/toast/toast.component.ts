import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @for (t of toastService.toasts(); track t.id) {
      <div class="toast" [class.show]="t.show">{{ t.message }}</div>
    }
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}

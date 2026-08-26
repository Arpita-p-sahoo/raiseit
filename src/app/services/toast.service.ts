import { Injectable, signal } from '@angular/core';

export interface ToastEntry {
  id: number;
  message: string;
  show: boolean;
}

let nextId = 1;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastEntry[]>([]);

  show(message: string): void {
    const id = nextId++;
    const entry: ToastEntry = { id, message, show: false };
    this.toasts.update((list) => [...list, entry]);

    requestAnimationFrame(() => {
      this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, show: true } : t)));
    });

    setTimeout(() => {
      this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, show: false } : t)));
      setTimeout(() => {
        this.toasts.update((list) => list.filter((t) => t.id !== id));
      }, 250);
    }, 3200);
  }
}

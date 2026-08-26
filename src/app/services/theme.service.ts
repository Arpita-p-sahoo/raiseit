import { Injectable, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';
const THEME_KEY = 'raiseit_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly choice = signal<ThemeChoice>(this.readStoredChoice());

  constructor() {
    this.applyToDocument(this.choice());
  }

  private readStoredChoice(): ThemeChoice {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  }

  private applyToDocument(choice: ThemeChoice): void {
    if (choice === 'light' || choice === 'dark') {
      document.documentElement.setAttribute('data-theme', choice);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  setChoice(choice: ThemeChoice): void {
    localStorage.setItem(THEME_KEY, choice);
    this.applyToDocument(choice);
    this.choice.set(choice);
  }
}

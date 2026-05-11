import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="animate-fade-in">
      <router-outlet />
    </div>
  `,
})
export class AdminShellComponent {}

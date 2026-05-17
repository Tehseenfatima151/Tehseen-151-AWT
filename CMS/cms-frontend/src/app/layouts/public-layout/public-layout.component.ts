import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <!-- Navbar -->
      <nav class="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <!-- Logo -->
          <div class="flex items-center gap-3" routerLink="/">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined text-white text-xl">shield</span>
            </div>
            <div>
              <h1 class="text-xl font-black tracking-tight text-primary dark:text-white leading-none">TrustCircle</h1>
              <p class="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Financial Oversight</p>
            </div>
          </div>

          <!-- Desktop Links -->
          <div class="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" class="hover:text-primary dark:hover:text-white transition-colors">How it Works</a>
            <a href="#public-committees" class="hover:text-primary dark:hover:text-white transition-colors">Committees</a>
            <a href="#trust-showcase" class="hover:text-primary dark:hover:text-white transition-colors">Leaderboard</a>
            <a href="#security" class="hover:text-primary dark:hover:text-white transition-colors">Security</a>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <button routerLink="/login" class="hidden md:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
            <button routerLink="/signup" class="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95">
              Get Started
            </button>
          </div>

        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
})
export class PublicLayoutComponent {}

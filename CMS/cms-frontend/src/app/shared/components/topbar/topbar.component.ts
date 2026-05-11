import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-40 flex justify-between items-center px-6 md:px-10 h-16 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      
      <div class="flex items-center gap-4 flex-1">
        <!-- Title or Breadcrumb could go here if needed -->
        <div class="hidden md:flex relative group w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input type="text" placeholder="Search committees, transactions, or users..." 
                 class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-[#1A2B4C] transition-all text-slate-800 dark:text-slate-200 outline-none">
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button (click)="themeService.toggleTheme()" class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
          <span class="material-symbols-outlined">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
        </button>
        
        <a routerLink="/notifications" class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95 relative inline-flex">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1 right-2 w-2 h-2 bg-error rounded-full border border-white dark:border-slate-900"></span>
        </a>
        
        <div class="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        <!-- User Profile Dropdown -->
        <div class="relative">
          <div class="flex items-center gap-3 cursor-pointer group" (click)="toggleDropdown()">
            <div class="text-right hidden md:block">
              <p class="font-label-md text-primary dark:text-white">{{ authService.currentUser()?.name || authService.currentUser()?.email?.split('@')?.[0] || 'Guest' }}</p>
              <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{{ authService.currentUser()?.role || 'user' }}</p>
            </div>
            <img [src]="authService.currentUser()?.avatar || 'assets/icons/default-avatar.png'" 
                 alt="User Profile" 
                 class="w-10 h-10 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm group-hover:border-primary transition-colors">
          </div>
          
          <!-- Dropdown Menu -->
          <div *ngIf="dropdownOpen()" 
               class="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 animate-fade-in z-50">
            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 block md:hidden">
              <p class="font-label-md text-primary dark:text-white truncate">{{ authService.currentUser()?.name || 'Guest' }}</p>
            </div>
            <a routerLink="/settings" (click)="dropdownOpen.set(false)" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </a>
            <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors text-left">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </div>
        
        <!-- Invisible overlay to close dropdown -->
        <div *ngIf="dropdownOpen()" (click)="dropdownOpen.set(false)" class="fixed inset-0 z-40"></div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  dropdownOpen = signal(false);

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  logout() {
    this.dropdownOpen.set(false);
    this.authService.logout();
  }
}

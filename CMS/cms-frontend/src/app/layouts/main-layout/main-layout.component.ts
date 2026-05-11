import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-background dark:bg-slate-950 transition-colors">
      <app-sidebar></app-sidebar>
      <main class="lg:ml-64 flex flex-col min-h-screen">
        <app-topbar></app-topbar>
        <div class="p-6 md:p-10 flex-1 relative animate-fade-in">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <!-- Mobile Bottom Nav (Visible only on small screens) -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50 transition-colors pb-safe">
        <a routerLink="/dashboard" routerLinkActive="text-[#1A2B4C] dark:text-white" class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#1A2B4C] dark:hover:text-white transition-colors">
          <span class="material-symbols-outlined text-xl">dashboard</span>
          <span class="text-[10px] font-semibold uppercase">Home</span>
        </a>
        <a routerLink="/committees" routerLinkActive="text-[#1A2B4C] dark:text-white" class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#1A2B4C] dark:hover:text-white transition-colors">
          <span class="material-symbols-outlined text-xl">groups</span>
          <span class="text-[10px] font-semibold uppercase">Committees</span>
        </a>
        <a routerLink="/transactions" routerLinkActive="text-[#1A2B4C] dark:text-white" class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#1A2B4C] dark:hover:text-white transition-colors">
          <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">receipt_long</span>
          <span class="text-[10px] font-semibold uppercase">Finance</span>
        </a>
        <a routerLink="/settings" routerLinkActive="text-[#1A2B4C] dark:text-white" class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#1A2B4C] dark:hover:text-white transition-colors">
          <span class="material-symbols-outlined text-xl">settings</span>
          <span class="text-[10px] font-semibold uppercase">Settings</span>
        </a>
      </nav>
    </div>
  `
})
export class MainLayoutComponent {}

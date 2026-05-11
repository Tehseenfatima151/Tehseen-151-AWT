import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen w-full bg-surface-bright dark:bg-slate-950 flex flex-col relative transition-colors">
      <!-- Abstract Decorative Background Elements -->
      <div class="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-[#b6c6f0]/20 dark:bg-[#b6c6f0]/10 blur-[120px] rounded-full pointer-events-none transition-colors"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-[#6dfe9c]/10 dark:bg-[#6dfe9c]/5 blur-[100px] rounded-full pointer-events-none transition-colors"></div>
      
      <div class="flex-grow grid place-items-center w-full py-8 px-4 z-10">
        <div class="w-full max-w-[380px] animate-scale-up">
          <router-outlet></router-outlet>
        </div>
      </div>
      
      <!-- Sub Footer with Legal -->
      <footer class="py-4 px-4 text-center w-full z-10 mt-auto flex-shrink-0">
        <div class="flex flex-wrap justify-center gap-4 mb-2">
          <a href="#" class="text-[11px] font-semibold text-outline dark:text-slate-500 hover:text-primary dark:hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="text-[11px] font-semibold text-outline dark:text-slate-500 hover:text-primary dark:hover:text-white transition-colors">Terms of Service</a>
          <a href="#" class="text-[11px] font-semibold text-outline dark:text-slate-500 hover:text-primary dark:hover:text-white transition-colors">Contact Support</a>
        </div>
        <p class="font-label-sm text-[10px] text-outline dark:text-slate-500 opacity-60">© 2026 TrustCircle Financial Systems. All rights reserved.</p>
      </footer>
    </div>
  `
})
export class AuthLayoutComponent {}

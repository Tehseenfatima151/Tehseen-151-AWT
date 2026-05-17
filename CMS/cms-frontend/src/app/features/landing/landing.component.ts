import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { Committee } from '../../core/models/trustcircle.models';

interface PublicProfile {
  id: string;
  displayName: string;
  trustScore: number;
  memberSince?: any;
  completedCommittees?: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta = inject(Meta);

  // Data signals
  stats = signal({ members: 0, activeCommittees: 0, totalVolume: 0 });
  publicCommittees = signal<(Committee & { id: string })[]>([]);
  topMembers = signal<PublicProfile[]>([]);
  
  loading = signal(true);

  // Demo Simulation State
  demoState = signal<'idle' | 'spinning' | 'winner'>('idle');
  demoWinner = signal<string>('');
  demoCurrentSpin = signal<string>('???');
  demoInterval: any;
  demoNames = ['Sarah M.', 'David K.', 'Aisha R.', 'Omar T.', 'Elena V.', 'Michael B.'];

  async ngOnInit() {
    this.title.setTitle('TrustCircle | Automated Financial Committees');
    this.meta.updateTag({ name: 'description', content: 'Join or create smart, rotating savings committees with secure payout draws and verified trust scores.' });
    this.meta.updateTag({ property: 'og:title', content: 'TrustCircle - Financial Trust, Automated' });
    this.meta.updateTag({ property: 'og:description', content: 'Smart Committee Management with Secure Payout Draws.' });

    await this.fetchPublicData();
  }

  ngOnDestroy() {
    if (this.demoInterval) clearInterval(this.demoInterval);
  }

  async fetchPublicData() {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, cannot load real data.');
      this.loading.set(false);
      return;
    }

    try {
      // Fetch active committees (real data)
      const commSnap = await getDocs(
        query(collection(getDb(), 'committees'), where('status', '==', 'active'), limit(6))
      );
      const committees = commSnap.docs.map(d => ({ id: d.id, ...d.data() } as Committee & { id: string }));
      this.publicCommittees.set(committees);
    } catch (e) {
      console.error('Error fetching real committees:', e);
    }

    try {
      // Fetch top profiles (real data)
      const profSnap = await getDocs(
        query(collection(getDb(), 'publicProfiles'), orderBy('trustScore', 'desc'), limit(4))
      );
      const profiles = profSnap.docs.map(d => ({ id: d.id, ...d.data() } as PublicProfile));
      this.topMembers.set(profiles);
    } catch (e) {
      console.error('Error fetching public profiles:', e);
    }

    // Calculate real stats based on fetched data
    let totalVol = 0;
    this.publicCommittees().forEach(c => {
      totalVol += (c.contributionAmount * c.maxMembers);
    });

    this.stats.set({
      members: this.topMembers().length, // For now, just show count of public profiles
      activeCommittees: this.publicCommittees().length,
      totalVolume: totalVol
    });

    this.loading.set(false);
  }

  // Removed mock data method to strictly use system data

  // Toss Demo Logic
  runDemoToss() {
    if (this.demoState() === 'spinning') return;
    
    this.demoState.set('spinning');
    let ticks = 0;
    
    this.demoInterval = setInterval(() => {
      this.demoCurrentSpin.set(this.demoNames[ticks % this.demoNames.length]);
      ticks++;
      
      if (ticks > 25) {
        clearInterval(this.demoInterval);
        this.demoWinner.set(this.demoNames[Math.floor(Math.random() * this.demoNames.length)]);
        this.demoState.set('winner');
      }
    }, 100);
  }

  resetDemo() {
    this.demoState.set('idle');
    this.demoWinner.set('');
  }

  getBadgeTier(score: number): { name: string; color: string; bg: string } {
    if (score >= 900) return { name: 'Platinum', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
    if (score >= 800) return { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (score >= 600) return { name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/20' };
    return { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-900/10 border-amber-900/20' };
  }
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-10 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2 text-slate-100">
              <Brain className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold">NeuroForge</span>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-400">
              Premium medical imaging infrastructure for AI-assisted brain reconstruction, segmentation, and review.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-200">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/viewer" className="transition hover:text-cyan-300">Interactive workspace</Link></li>
              <li><Link href="/upload" className="transition hover:text-cyan-300">Intake studio</Link></li>
              <li><Link href="/docs" className="transition hover:text-cyan-300">Developer reference</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-200">Standards</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-400" /> HIPAA-aware review</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-blue-400" /> Clinical-ready formats</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-400" /> Modern AI stack</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © 2026 NeuroForge. Built for ambitious medical AI products.
        </div>
      </div>
    </footer>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Layers, Upload, FileText, Cpu, Github } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.24em] text-slate-100">NEUROFORGE</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">medical ai studio</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
          <Link href="/viewer" className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive('/viewer') ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            Workspace
          </Link>
          <Link href="/upload" className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive('/upload') ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            Intake
          </Link>
          <Link href="/docs" className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive('/docs') ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            Reference
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://github.com/upparavinod7/3d-Brain-Generation" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <Github className="h-4 w-4" />
          </a>
          <Link href="/viewer" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90">
            <Cpu className="h-4 w-4" />
            Launch
          </Link>
        </div>
      </div>
    </header>
  );
}

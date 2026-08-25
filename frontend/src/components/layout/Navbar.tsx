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
            <div className="text-sm font-bold tracking-wider text-slate-100">3D BRAIN AI</div>
            <div className="text-[10px] uppercase tracking-wider text-cyan-400">Reconstruction & Generation</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
          <Link href="/viewer" className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${isActive('/viewer') ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <Brain className="h-3.5 w-3.5 text-cyan-400" />
            3D Viewer Studio
          </Link>
          <Link href="/upload" className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${isActive('/upload') ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <Upload className="h-3.5 w-3.5 text-cyan-400" />
            Upload MRI Scan
          </Link>
          <Link href="/docs" className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${isActive('/docs') ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            Guide & Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://github.com/upparavinod7/3d-Brain-Generation" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" title="GitHub Repository">
            <Github className="h-4 w-4" />
          </a>
          <Link href="/viewer" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:opacity-90 shadow-md">
            <Cpu className="h-4 w-4" />
            Open 3D Studio
          </Link>
        </div>

      </div>
    </header>
  );
}

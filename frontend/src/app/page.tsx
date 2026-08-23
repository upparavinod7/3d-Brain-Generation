'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Activity, ShieldCheck, Sparkles, Cpu, Layers, ScanLine } from 'lucide-react';
import BrainCanvas from '@/components/viewer3d/BrainCanvas';

const highlights = [
  { icon: Brain, title: 'Immersive anatomy review', description: 'A cinematic workspace for segmentation, rendering, and clinical collaboration.' },
  { icon: Activity, title: 'Pipeline intelligence', description: 'From ingestion to reconstruction, the experience stays clear and premium.' },
  { icon: ShieldCheck, title: 'Secure by default', description: 'Built with privacy-aware workflows and resilient review states.' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-4 w-4" />
              AI 3D Brain Reconstruction Platform
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
                AI-Powered <span className="text-gradient-cyan">3D Brain Generation</span> & Reconstruction.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-400">
                Transform sparse MRI scans into high-definition 3D brain models with deep learning super-resolution, automated tissue volume measurements, and 1-click printable exports.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/viewer" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-6 py-3 text-xs font-bold text-slate-950 transition shadow-lg">
                Open 3D Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/10">
                <ScanLine className="h-4 w-4 text-cyan-400" />
                Upload MRI Scan
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['34.8 dB', 'Clarity Score (PSNR)'],
                ['4x Faster', 'Scan Acceleration'],
                ['3D STL/GLB', 'Printable Geometry'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="mt-1 text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>

          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/50 p-3 shadow-[0_40px_120px_rgba(8,15,32,0.6)]">
            <BrainCanvas hasLesion />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm leading-7 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-blue-500/10 p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                <Layers className="h-4 w-4" />
                Modular product architecture
              </div>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built for thoughtful review, not cluttered dashboards.</h2>
              <p className="max-w-xl text-lg leading-8 text-slate-400">
                The experience combines immersive visuals, clear pipeline feedback, and a calm interface so experts can focus on anatomy rather than controls.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Fast ingestion', 'A polished intake flow for medical data and synthetic previews.'],
                ['Rich segmentation', 'Clear tissue and lesion overlays with volumetric insights.'],
                ['3D export', 'Surface artifacts for web, print, and downstream workflows.'],
                ['Clinical-ready', 'A thoughtful review surface for experts and collaborators.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-7 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

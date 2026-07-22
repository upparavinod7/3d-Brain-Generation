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
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              <Sparkles className="h-4 w-4" />
              AI-native 3D brain generation platform
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
                Design-forward <span className="text-gradient-cyan">medical intelligence</span> for the next era of imaging.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-400">
                NeuroForge reimagines brain MRI review with cinematic visuals, modular AI workflows, and a workspace that feels as polished as the science behind it.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/viewer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90">
                Explore the workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                <ScanLine className="h-4 w-4" />
                Begin intake
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['94%', 'pipeline readiness'],
                ['24/7', 'review continuity'],
                ['3D', 'surface export'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
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

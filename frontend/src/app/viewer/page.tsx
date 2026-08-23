'use client';

import React, { useEffect, useState } from 'react';
import BrainCanvas from '@/components/viewer3d/BrainCanvas';
import OrthogonalViewer from '@/components/sliceViewer/OrthogonalViewer';
import { createSyntheticScan } from '@/lib/api';
import { ScanData } from '@/types';
import { Activity, Cpu, Download, FileText, Layers, Sparkles, Sliders } from 'lucide-react';

export default function WorkstationViewerPage() {
  const [hasLesion, setHasLesion] = useState(true);
  const [scan, setScan] = useState<ScanData | null>(null);
  const [activeTab, setActiveTab] = useState<'layers' | 'metrics' | 'export'>('metrics');
  const [show2DTray, setShow2DTray] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const [highlightTissue, setHighlightTissue] = useState<'all' | 'gm' | 'wm' | 'csf' | 'lesion'>('all');
  const [exploded, setExploded] = useState(false);

  const loadScan = async (pathology: boolean) => {
    setHasLesion(pathology);
    const data = await createSyntheticScan(pathology);
    setScan(data);
  };

  useEffect(() => {
    loadScan(true);
  }, []);

  const stats = scan?.volumetric_stats;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/50 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-white">NeuroForge Workspace</h1>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">v2 preview</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{scan?.scan_id || 'Preparing pipeline'} · {scan?.modality || 'Synthetic MRI'} · {scan?.spacing.join(' × ')} mm</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              <button onClick={() => loadScan(false)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${!hasLesion ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-300 hover:text-white'}`}>Normal</button>
              <button onClick={() => loadScan(true)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${hasLesion ? 'bg-rose-500/15 text-rose-300' : 'text-slate-300 hover:text-white'}`}>Pathology</button>
            </div>
            <a href={`http://localhost:8000/api/v1/reports/${scan?.scan_id || 'demo'}/pdf`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950">
              <FileText className="h-4 w-4" />
              Export report
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <BrainCanvas hasLesion={hasLesion} opacity={opacity} setOpacity={setOpacity} highlightTissue={highlightTissue} setHighlightTissue={setHighlightTissue} exploded={exploded} setExploded={setExploded} />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
          <div className="flex rounded-full border border-white/10 bg-slate-950/60 p-1 text-sm">
            <button onClick={() => setActiveTab('metrics')} className={`flex-1 rounded-full px-3 py-2 font-medium transition ${activeTab === 'metrics' ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:text-white'}`}><Activity className="mr-2 inline h-4 w-4" />Metrics</button>
            <button onClick={() => setActiveTab('layers')} className={`flex-1 rounded-full px-3 py-2 font-medium transition ${activeTab === 'layers' ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:text-white'}`}><Layers className="mr-2 inline h-4 w-4" />Anatomy</button>
            <button onClick={() => setActiveTab('export')} className={`flex-1 rounded-full px-3 py-2 font-medium transition ${activeTab === 'export' ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:text-white'}`}><Download className="mr-2 inline h-4 w-4" />Exports</button>
          </div>

          {activeTab === 'metrics' && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">Pipeline snapshot</span>
                  <span className="font-mono text-cyan-300">{scan?.pipeline?.progress || 94}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${scan?.pipeline?.progress || 94}%` }} />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">{scan?.pipeline?.message || 'The review pipeline is ready for inspection.'}</p>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Grey matter</span><span className="font-semibold text-white">{stats?.grey_matter_volume_cm3} cm³</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">White matter</span><span className="font-semibold text-white">{stats?.white_matter_volume_cm3} cm³</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">CSF</span><span className="font-semibold text-white">{stats?.csf_volume_cm3} cm³</span></div>
                {hasLesion && <div className="flex items-center justify-between"><span className="text-slate-400">Lesion</span><span className="font-semibold text-rose-300">{stats?.lesion_volume_cm3} cm³</span></div>}
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-white">Opacity</span>
                  <span className="font-mono text-cyan-300">{Math.round(opacity * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-white">Exploded anatomy</span>
                  <input type="checkbox" checked={exploded} onChange={(e) => setExploded(e.target.checked)} className="h-4 w-4 accent-cyan-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'gm', 'wm', 'csf', 'lesion'] as const).map((tissue) => (
                    <button key={tissue} onClick={() => setHighlightTissue(tissue)} className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${highlightTissue === tissue ? 'bg-cyan-500/15 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>{tissue}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-white"><Download className="h-4 w-4 text-cyan-300" />Export assets</div>
                <div className="space-y-2">
                  <a href="http://localhost:8000/static/outputs/mesh_demo.glb" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-slate-300">GLB <span className="text-cyan-300">Download</span></a>
                  <a href="http://localhost:8000/static/outputs/mesh_demo.stl" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-slate-300">STL <span className="text-cyan-300">Download</span></a>
                  <a href="http://localhost:8000/static/outputs/mesh_demo.obj" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-slate-300">OBJ <span className="text-cyan-300">Download</span></a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-4">
        <button onClick={() => setShow2DTray(!show2DTray)} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Slice review {show2DTray ? 'collapse' : 'expand'}
        </button>
        {show2DTray && <OrthogonalViewer scanId={scan?.scan_id || 'demo'} />}
      </div>
    </div>
  );
}

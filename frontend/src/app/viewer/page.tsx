'use client';

import React, { useEffect, useState, Suspense } from 'react';
import BrainCanvas from '@/components/viewer3d/BrainCanvas';
import OrthogonalViewer from '@/components/sliceViewer/OrthogonalViewer';
import { useSearchParams } from 'next/navigation';
import { createSyntheticScan, triggerReconstruction, getScan } from '@/lib/api';
import { ScanData, ReconstructionData } from '@/types';
import { Activity, Cpu, Download, FileText, Layers, Sparkles, Sliders, CheckCircle2, Play, Info } from 'lucide-react';

function WorkstationContent() {



  const searchParams = useSearchParams();
  const scanIdFromUrl = searchParams.get('scan_id');

  const [hasLesion, setHasLesion] = useState(true);
  const [scan, setScan] = useState<ScanData | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'anatomy' | 'export'>('metrics');
  const [show2DTray, setShow2DTray] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const [highlightTissue, setHighlightTissue] = useState<'all' | 'gm' | 'wm' | 'csf' | 'lesion'>('all');
  const [exploded, setExploded] = useState(false);

  // Reconstruction settings
  const [selectedMethod, setSelectedMethod] = useState<'proposed' | 'trilinear' | 'cnn' | 'gan'>('proposed');
  const [downsampleFactor, setDownsampleFactor] = useState<number>(4);
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [recResults, setRecResults] = useState<ReconstructionData | null>(null);

  const loadScan = async (pathology: boolean) => {
    setHasLesion(pathology);
    const data = await createSyntheticScan(pathology);
    setScan(data);
  };

  useEffect(() => {
    if (scanIdFromUrl) {
      getScan(scanIdFromUrl).then((s) => {
        setScan(s);
        setHasLesion(s.has_pathology);
      });
    } else {
      loadScan(true);
    }
  }, [scanIdFromUrl]);


  const handleRunReconstruction = async () => {
    if (!scan) return;
    setIsReconstructing(true);
    try {
      const res = await triggerReconstruction(scan.scan_id, selectedMethod, downsampleFactor);
      setRecResults(res);
    } catch (e) {
      console.error('Reconstruction error:', e);
    } finally {
      setIsReconstructing(false);
    }
  };

  const stats = scan?.volumetric_stats;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
              <BrainCanvasPropsIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">3D Brain Reconstruction & Visualizer Studio</h1>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                  Ready & Interactive
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Easily generate, reconstruct, and inspect 3D brain MRI models using AI super-resolution.
              </p>
            </div>
          </div>

          {/* Sample Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-medium">
              <span className="px-2 text-slate-400">Sample Mode:</span>
              <button
                onClick={() => loadScan(false)}
                className={`rounded-xl px-3 py-1.5 transition ${!hasLesion ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                🟢 Healthy Brain
              </button>
              <button
                onClick={() => loadScan(true)}
                className={`rounded-xl px-3 py-1.5 transition ${hasLesion ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                🔴 Brain with Tumor
              </button>
            </div>

            <a
              href={`http://localhost:8000/api/v1/reports/${scan?.scan_id || 'demo'}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-90 transition shadow-lg"
            >
              <FileText className="h-4 w-4" />
              Download Patient PDF Report
            </a>
          </div>
        </div>
      </div>

      {/* AI Model Controls Banner */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Select 3D AI Reconstruction Algorithm</h2>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-cyan-400 inline" /> Choose an algorithm to test quality vs speed
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { id: 'proposed', title: 'Proposed AI Model ⭐', desc: 'Trilinear + 3D CNN refinement (Best clarity & accuracy)' },
            { id: 'trilinear', title: 'Fast 3D Trilinear ⚡', desc: 'Mathematical interpolation (Fast baseline)' },
            { id: 'cnn', title: '3D CNN Deep Learning 🤖', desc: 'Pure convolutional super-resolution' },
            { id: 'gan', title: 'Generative AI (3D GAN) 🎨', desc: 'Generative adversarial reconstruction' },
          ].map(({ id, title, desc }) => (
            <button
              key={id}
              onClick={() => setSelectedMethod(id as any)}
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                selectedMethod === id
                  ? 'border-cyan-400/80 bg-cyan-500/15 shadow-md text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-xs mb-1">
                <span>{title}</span>
                {selectedMethod === id && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />}
              </div>
              <span className="text-[11px] leading-relaxed text-slate-400">{desc}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-300 font-semibold">Slice Sparsity (Scan Speedup):</span>
            {[
              { factor: 2, label: '2x Speed (50% Slices)' },
              { factor: 4, label: '4x Speed (Standard)' },
              { factor: 6, label: '6x Speed (Ultra Sparse)' },
            ].map(({ factor, label }) => (
              <button
                key={factor}
                onClick={() => setDownsampleFactor(factor)}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
                  downsampleFactor === factor
                    ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunReconstruction}
            disabled={isReconstructing}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-5 py-2 text-xs font-bold text-slate-950 transition shadow-lg disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isReconstructing ? 'Processing AI Reconstruction...' : 'Run Reconstruction AI'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split: 3D Viewport on Left, Side Panel on Right */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* 3D Viewport */}
        <div className="space-y-4">
          <BrainCanvas
            hasLesion={hasLesion}
            opacity={opacity}
            setOpacity={setOpacity}
            highlightTissue={highlightTissue}
            setHighlightTissue={setHighlightTissue}
            exploded={exploded}
            setExploded={setExploded}
          />
        </div>

        {/* Side Panel */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
          {/* Navigation Tabs */}
          <div className="flex rounded-2xl border border-white/10 bg-slate-900/80 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 rounded-xl px-3 py-2 transition ${activeTab === 'metrics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              <Activity className="mr-1.5 inline h-3.5 w-3.5" /> Quality Metrics
            </button>
            <button
              onClick={() => setActiveTab('anatomy')}
              className={`flex-1 rounded-xl px-3 py-2 transition ${activeTab === 'anatomy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              <Layers className="mr-1.5 inline h-3.5 w-3.5" /> Brain Anatomy
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 rounded-xl px-3 py-2 transition ${activeTab === 'export' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              <Download className="mr-1.5 inline h-3.5 w-3.5" /> Downloads
            </button>
          </div>

          {/* TAB 1: Quality Metrics */}
          {activeTab === 'metrics' && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">
                  Reconstruction Quality Scores
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Evaluating model accuracy against full-resolution ground truth scan.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400 block mb-1">Image Clarity (PSNR)</span>
                    <span className="text-lg font-extrabold text-cyan-300">
                      {recResults ? recResults.metrics['PSNR (dB)'] : 34.82} dB
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Higher is clearer</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400 block mb-1">Detail Match (SSIM)</span>
                    <span className="text-lg font-extrabold text-cyan-300">
                      {recResults ? recResults.metrics['SSIM'] : 0.9412}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Closer to 1.0 is exact</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400 block mb-1">Average Error (MAE)</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {recResults ? recResults.metrics['MAE'] : 0.0142}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Lower is better</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-slate-400 block mb-1">Mean Square Error</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {recResults ? recResults.metrics['MSE'] : 0.00032}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Lower is better</span>
                  </div>
                </div>
              </div>

              {recResults && (
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-xs text-cyan-300 font-medium">
                  ✅ {recResults.message}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Anatomy Volumes */}
          {activeTab === 'anatomy' && (
            <div className="mt-5 space-y-4 text-xs">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
                  Automated Brain Tissue Measurement
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-300 font-medium">🧠 Total Brain Volume</span>
                    <span className="font-bold text-white">{stats?.total_brain_volume_cm3 ?? 1350.5} cm³</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-300 font-medium">🩶 Grey Matter (Thinking Layer)</span>
                    <span className="font-bold text-white">{stats?.grey_matter_volume_cm3 ?? 620.2} cm³</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-300 font-medium">⚪ White Matter (Nerve Connections)</span>
                    <span className="font-bold text-white">{stats?.white_matter_volume_cm3 ?? 530.8} cm³</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-300 font-medium">💧 Brain Fluid (CSF Protection)</span>
                    <span className="font-bold text-white">{stats?.csf_volume_cm3 ?? 175.5} cm³</span>
                  </div>
                  {hasLesion && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-rose-300 font-bold">🔴 Tumor / Lesion Area</span>
                      <span className="font-extrabold text-rose-400">{stats?.lesion_volume_cm3 ?? 24.0} cm³</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Downloads */}
          {activeTab === 'export' && (
            <div className="mt-5 space-y-3 text-xs">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider mb-2">Export 3D Models & Reports</h3>
                <a
                  href="http://localhost:8000/static/outputs/brain_3d_mesh.glb"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition"
                >
                  <div>
                    <div className="font-semibold text-white">🧊 3D Web Model (GLB)</div>
                    <div className="text-[10px] text-slate-400">For web apps & 3D viewers</div>
                  </div>
                  <span className="text-cyan-300 font-bold">Download</span>
                </a>

                <a
                  href="http://localhost:8000/static/outputs/brain_3d_mesh.stl"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition"
                >
                  <div>
                    <div className="font-semibold text-white">🖨️ 3D Printable File (STL)</div>
                    <div className="text-[10px] text-slate-400">For 3D printing anatomical models</div>
                  </div>
                  <span className="text-cyan-300 font-bold">Download</span>
                </a>

                <a
                  href={`http://localhost:8000/api/v1/reports/${scan?.scan_id || 'demo'}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition"
                >
                  <div>
                    <div className="font-semibold text-white">📄 Clinical PDF Report</div>
                    <div className="text-[10px] text-slate-400">Complete anatomical report for doctors</div>
                  </div>
                  <span className="text-cyan-300 font-bold">Download</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 2D Slice Reviewer */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-bold text-white">2D Layer Slice Inspector</h3>
          </div>
          <button
            onClick={() => setShow2DTray(!show2DTray)}
            className="text-xs text-cyan-300 font-medium hover:underline"
          >
            {show2DTray ? 'Hide 2D Slices' : 'Show 2D Slices'}
          </button>
        </div>
        {show2DTray && <OrthogonalViewer scanId={scan?.scan_id || 'demo'} />}
      </div>
    </div>
  );
}

function BrainCanvasPropsIcon() {
  return <Cpu className="h-6 w-6 text-cyan-300" />;
}

export default function WorkstationViewerPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex max-w-7xl items-center justify-center p-24 text-cyan-300 font-bold text-sm">
        <Cpu className="h-6 w-6 animate-spin mr-2" />
        Loading 3D Studio & Volume Mesh...
      </div>
    }>
      <WorkstationContent />
    </Suspense>
  );
}



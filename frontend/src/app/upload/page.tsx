'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck, ShieldCheck, Upload } from 'lucide-react';

const formats = ['DICOM', 'NIfTI', 'NRRD', 'MHA', 'ZIP archive'];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [anonymize, setAnonymize] = useState(true);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

  const progress = useMemo(() => {
    if (status === 'uploading') return 35;
    if (status === 'processing') return 82;
    if (status === 'done') return 100;
    return 0;
  }, [status]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processUpload(e.dataTransfer.files[0].name);
    }
  };

  const processUpload = (filename: string) => {
    setUploadedFile(filename);
    setStatus('uploading');
    window.setTimeout(() => {
      setStatus('processing');
      window.setTimeout(() => setStatus('done'), 1000);
    }, 900);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">\n          <Upload className="h-4 w-4" />
          Intake studio
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">Upload once. Review everything.</h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-400">
          Securely ingest MRI volumes and prepare them for reconstruction, segmentation, and 3D review in a single flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/50 p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`rounded-[24px] border-2 border-dashed p-10 text-center transition ${dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <Upload className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-white">Drop your imaging archive</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              {uploadedFile ? `Selected file: ${uploadedFile}` : 'DICOM, NIfTI, NRRD, MHA, and ZIP archives are all supported.'}
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950">
              Browse files
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0].name)} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {formats.map((format) => (
              <span key={format} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{format}</span>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-100">Privacy-aware processing</div>
                <div className="text-sm text-slate-400">Auto-scrub PHI metadata before review.</div>
              </div>
            </div>
            <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)} className="h-4 w-4 accent-cyan-500" />
          </div>

          {status !== 'idle' && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                <span>{status === 'uploading' ? 'Uploading archive' : status === 'processing' ? 'Preparing segmentation and mesh' : 'Pipeline complete'}</span>
                <span className="font-mono text-cyan-300">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              {status === 'done' && (
                <div className="mt-4 flex justify-end">
                  <Link href="/viewer" className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300">
                    Open workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <FileCheck className="h-4 w-4 text-cyan-300" />
              Recommended next step
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-400">Once the archive is ready, the review workspace will surface segmentation insights, tissue overlays, and exportable geometry.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Upload className="h-4 w-4" />
          Easy MRI Scan Upload
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">Upload Your Brain MRI Scan</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
          Upload DICOM or NIfTI scan files to instantly reconstruct 3D brain models, measure tissue volumes, and generate clinical reports.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-xl">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <Upload className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Drag & Drop Your MRI Files Here</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {uploadedFile ? `Selected File: ${uploadedFile}` : 'Supports DICOM (.dcm), NIfTI (.nii, .nii.gz), and ZIP folder archives.'}
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg">
              Browse Files on Computer
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0].name)} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Supported Formats:</span>
            {formats.map((format) => (
              <span key={format} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">{format}</span>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-100 text-xs">Patient Privacy Protection</div>
                <div className="text-[11px] text-slate-400">Automatically remove patient name and ID metadata before analysis.</div>
              </div>
            </div>
            <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)} className="h-4 w-4 accent-cyan-500 cursor-pointer" />
          </div>

          {status !== 'idle' && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>{status === 'uploading' ? 'Uploading file archive...' : status === 'processing' ? 'Processing 3D reconstruction and segmentation...' : 'Ready for inspection'}</span>
                <span className="font-mono text-cyan-300">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              {status === 'done' && (
                <div className="mt-4 flex justify-end">
                  <Link href="/viewer" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition">
                    Open 3D Viewer Studio
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <FileCheck className="h-4 w-4 text-cyan-300" />
              What Happens Next?
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Once uploaded, the platform generates interactive 3D brain renders, calculates grey/white matter volume percentages, and provides printable STL models & clinical PDF reports.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

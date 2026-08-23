'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck, ShieldCheck, Upload, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { uploadDicomSeries } from '@/lib/api';
import { ScanData } from '@/types';

const formats = ['DICOM (.dcm)', 'NIfTI (.nii, .nii.gz)', 'ZIP Archive (.zip)'];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [anonymize, setAnonymize] = useState(true);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedScan, setUploadedScan] = useState<ScanData | null>(null);

  const progress = useMemo(() => {
    if (status === 'uploading') return 45;
    if (status === 'processing') return 88;
    if (status === 'done') return 100;
    return 0;
  }, [status]);

  const handleFilesSelect = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length > 0) {
      setSelectedFiles(filesArray);
      setErrorMessage(null);
      setStatus('idle');
      setUploadedScan(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setStatus('uploading');
    setErrorMessage(null);

    try {
      setStatus('processing');
      const scanResult = await uploadDicomSeries(selectedFiles);
      setUploadedScan(scanResult);
      setStatus('done');
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMessage(err?.message || 'Failed to process DICOM files. Please verify file format.');
      setStatus('error');
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1 text-xs font-bold text-cyan-300">
          <Upload className="h-4 w-4" />
          Multi-Slice DICOM Scan Intake
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">Upload Your Brain MRI Scan</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400">
          Select single or multiple DICOM (.dcm) slices or a ZIP folder archive. The platform automatically stacks slices into a 3D MRI volume, segments tissues, and generates interactive 3D models.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left Column: Drag & Drop Input */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-xl">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
              dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <Upload className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Drag & Drop Your DICOM Files Here</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Select all DICOM slices (e.g. 24 or 50 files) or a single .zip archive.
            </p>

            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg">
              Browse Multiple Files
              <input
                type="file"
                multiple
                accept=".dcm,.DCM,.zip,.nii,.nii.gz"
                className="hidden"
                onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
              />
            </label>
          </div>

          {/* Selected File List / Count */}
          {selectedFiles.length > 0 && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} Selected
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="mt-2 max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-300 font-mono">
                {selectedFiles.slice(0, 5).map((f, i) => (
                  <div key={i} className="truncate">• {f.name}</div>
                ))}
                {selectedFiles.length > 5 && (
                  <div className="text-slate-400 italic">+ {selectedFiles.length - 5} more files</div>
                )}
              </div>

              <button
                onClick={handleUploadSubmit}
                disabled={status === 'uploading' || status === 'processing'}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-extrabold text-slate-950 transition hover:opacity-90 shadow-lg disabled:opacity-50"
              >
                {status === 'uploading' || status === 'processing' ? 'Processing 3D Brain Scan...' : '🚀 Process & Generate 3D Brain Model'}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/10">
            <span className="font-semibold text-slate-300">Supported Formats:</span>
            {formats.map((format) => (
              <span key={format} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">{format}</span>
            ))}
          </div>
        </div>

        {/* Right Column: Status & Privacy */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-100 text-xs">Patient Privacy Scrubbing</div>
                <div className="text-[11px] text-slate-400">Automatically removes patient name & DICOM metadata headers.</div>
              </div>
            </div>
            <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)} className="h-4 w-4 accent-cyan-500 cursor-pointer" />
          </div>

          {/* Progress / Status Panel */}
          {status !== 'idle' && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>
                  {status === 'uploading' ? 'Uploading DICOM slice files...' : status === 'processing' ? 'Stacking 3D volume & segmenting tissue...' : status === 'done' ? '3D Reconstruction Ready!' : 'Processing Error'}
                </span>
                <span className="font-mono text-cyan-300">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
              </div>

              {status === 'done' && uploadedScan && (
                <div className="mt-5 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    3D Brain MRI Successfully Processed!
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                    <div>Scan ID: {uploadedScan.scan_id}</div>
                    <div>Dimensions: {uploadedScan.dimensions.join(' × ')}</div>
                    <div>Modality: {uploadedScan.modality}</div>
                    <div>Pathology Detected: {uploadedScan.has_pathology ? '🔴 Tumor / Lesion Detected' : '🟢 Normal Brain'}</div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link href={`/viewer?scan_id=${uploadedScan.scan_id}`} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 transition shadow-md">
                      Open in 3D Viewer Studio
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <FileCheck className="h-4 w-4 text-cyan-300" />
              Processing Pipeline & Outputs
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              When DICOM slices are uploaded, the platform stacks them spatially along the Z-axis, runs tissue classification (Grey Matter, White Matter, Brain Fluid, Tumor), and generates downloadable STL/GLB 3D models and PDF clinical reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

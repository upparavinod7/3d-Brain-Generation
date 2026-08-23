'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crosshair, Layers } from 'lucide-react';
import { fetchScanSlice } from '@/lib/api';
import { SliceData } from '@/types';

interface OrthogonalViewerProps {
  scanId: string;
}

export default function OrthogonalViewer({ scanId }: OrthogonalViewerProps) {
  const [axialIndex, setAxialIndex] = useState(25);
  const [sagittalIndex, setSagittalIndex] = useState(128);
  const [coronalIndex, setCoronalIndex] = useState(128);

  const [axialData, setAxialData] = useState<SliceData | null>(null);
  const [sagittalData, setSagittalData] = useState<SliceData | null>(null);
  const [coronalData, setCoronalData] = useState<SliceData | null>(null);

  const [showSegOverlay, setShowSegOverlay] = useState(true);
  const [windowLevel, setWindowLevel] = useState<'brain' | 'bone' | 'high_contrast'>('brain');

  useEffect(() => {
    fetchScanSlice(scanId, 'axial', axialIndex).then(setAxialData);
  }, [scanId, axialIndex]);

  useEffect(() => {
    fetchScanSlice(scanId, 'sagittal', sagittalIndex).then(setSagittalData);
  }, [scanId, sagittalIndex]);

  useEffect(() => {
    fetchScanSlice(scanId, 'coronal', coronalIndex).then(setSagittalData);
  }, [scanId, coronalIndex]);



  // Render 2D Slice Canvas
  const renderSliceCanvas = (matrix: number[][] | undefined, segMatrix: number[][] | undefined) => {
    if (!matrix) {
      return (
        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
          Loading 2D Slice...
        </div>
      );
    }

    const size = matrix.length;
    return (
      <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden border border-slate-800 group">
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          {matrix.map((row, y) =>
            row.map((val, x) => {
              let gray = Math.floor(val * 255);
              if (windowLevel === 'high_contrast') gray = val > 0.4 ? 255 : 0;
              
              const segVal = segMatrix ? segMatrix[y][x] : 0;
              let fill = `rgb(${gray}, ${gray}, ${gray})`;
              
              if (showSegOverlay && segVal > 0) {
                if (segVal === 4) fill = `rgba(239, 68, 68, 0.75)`; // Lesion Red
                else if (segVal === 3) fill = `rgba(59, 130, 246, 0.4)`; // WM Blue
                else if (segVal === 2) fill = `rgba(16, 185, 129, 0.4)`; // GM Green
                else if (segVal === 1) fill = `rgba(6, 182, 212, 0.4)`; // CSF Cyan
              }

              return (
                <rect
                  key={`${y}-${x}`}
                  x={x}
                  y={y}
                  width="1.05"
                  height="1.05"
                  fill={fill}
                />
              );
            })
          )}

          {/* Synchronized Crosshairs */}
          <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>

        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          W/L: {windowLevel.toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">2D Cross-Section MRI Slice Viewer</h3>
            <p className="text-xs text-slate-400">Examine 2D cross-section MRI slices layer by layer across 3 directions.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => setShowSegOverlay(!showSegOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              showSegOverlay
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {showSegOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showSegOverlay ? 'AI Tissue Overlay (ON)' : 'AI Tissue Overlay (OFF)'}
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'brain', label: 'Standard View' },
              { id: 'high_contrast', label: 'High Contrast' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setWindowLevel(preset.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  windowLevel === preset.id
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Legend */}
      {showSegOverlay && (
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Color Guide:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/90 inline-block" /> 🔴 Tumor / Lesion</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/90 inline-block" /> 🔵 White Matter</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/90 inline-block" /> 🟢 Grey Matter</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cyan-400/90 inline-block" /> 🩵 Brain Fluid</span>
        </div>
      )}

      {/* 3 Orthogonal Viewports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Axial View */}
        <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Crosshair className="w-3.5 h-3.5" /> Top-Down Slices (Axial)
            </span>
            <span className="font-mono text-slate-400">Layer {axialIndex} / 63</span>
          </div>
          {renderSliceCanvas(axialData?.mri, axialData?.segmentation)}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Bottom</span>
            <input
              type="range"
              min="0"
              max="50"
              value={axialIndex}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAxialIndex(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-medium">Top</span>
          </div>
        </div>

        {/* Sagittal View */}
        <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Crosshair className="w-3.5 h-3.5" /> Side Slices (Sagittal)
            </span>
            <span className="font-mono text-slate-400">Slice {sagittalIndex} / 255</span>
          </div>
          {renderSliceCanvas(sagittalData?.mri, sagittalData?.segmentation)}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Left</span>
            <input
              type="range"
              min="0"
              max="255"
              value={sagittalIndex}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSagittalIndex(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-medium">Right</span>
          </div>
        </div>

        {/* Coronal View */}
        <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Crosshair className="w-3.5 h-3.5" /> Front-to-Back Slices (Coronal)
            </span>
            <span className="font-mono text-slate-400">Slice {coronalIndex} / 255</span>
          </div>
          {renderSliceCanvas(coronalData?.mri, coronalData?.segmentation)}

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Back</span>
            <input
              type="range"
              min="0"
              max="255"
              value={coronalIndex}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoronalIndex(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-medium">Front</span>
          </div>
        </div>
      </div>


    </div>
  );
}

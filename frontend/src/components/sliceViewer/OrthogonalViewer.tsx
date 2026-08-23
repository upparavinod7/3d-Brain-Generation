'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crosshair, Layers } from 'lucide-react';
import { fetchScanSlice } from '@/lib/api';
import { SliceData } from '@/types';

interface OrthogonalViewerProps {
  scanId: string;
}

export default function OrthogonalViewer({ scanId }: OrthogonalViewerProps) {
  const [axialIndex, setAxialIndex] = useState(32);
  const [sagittalIndex, setSagittalIndex] = useState(64);
  const [coronalIndex, setCoronalIndex] = useState(64);

  const [axialData, setAxialData] = useState<SliceData | null>(null);
  const [showSegOverlay, setShowSegOverlay] = useState(true);
  const [windowLevel, setWindowLevel] = useState<'brain' | 'bone' | 'high_contrast'>('brain');

  useEffect(() => {
    fetchScanSlice(scanId, 'axial', axialIndex).then(setAxialData);
  }, [scanId, axialIndex]);

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
          <h3 className="text-base font-bold text-white">2D Orthogonal Slice Viewer</h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowSegOverlay(!showSegOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              showSegOverlay
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {showSegOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            AI Segmentation Overlay
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['brain', 'bone', 'high_contrast'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setWindowLevel(preset)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                  windowLevel === preset
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Orthogonal Viewports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Axial View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Crosshair className="w-3.5 h-3.5" /> Axial View (Z)
            </span>
            <span className="font-mono text-slate-400">Slice: {axialIndex} / 63</span>
          </div>
          {renderSliceCanvas(axialData?.mri, axialData?.segmentation)}
          <input
            type="range"
            min="0"
            max="63"
            value={axialIndex}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAxialIndex(parseInt(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Sagittal View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Crosshair className="w-3.5 h-3.5" /> Sagittal View (X)
            </span>
            <span className="font-mono text-slate-400">Slice: {sagittalIndex} / 127</span>
          </div>
          {renderSliceCanvas(axialData?.mri, axialData?.segmentation)}
          <input
            type="range"
            min="0"
            max="127"
            value={sagittalIndex}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSagittalIndex(parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Coronal View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Crosshair className="w-3.5 h-3.5" /> Coronal View (Y)
            </span>
            <span className="font-mono text-slate-400">Slice: {coronalIndex} / 127</span>
          </div>
          {renderSliceCanvas(axialData?.mri, axialData?.segmentation)}
          <input
            type="range"
            min="0"
            max="127"
            value={coronalIndex}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoronalIndex(parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

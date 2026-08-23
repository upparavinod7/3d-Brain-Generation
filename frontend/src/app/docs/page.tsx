'use client';

import React from 'react';
import { FileText, Code2, Terminal } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" /> Developer & API Reference
        </div>
        <h1 className="text-3xl font-extrabold text-white">REST API & Architecture Documentation</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          FastAPI backend endpoints, PyTorch / MONAI tissue segmentation pipeline, Marching Cubes 3D mesh engine specifications, and deployment guides.
        </p>
      </div>

      {/* Endpoints Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" /> REST API Endpoints
        </h2>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-slate-300 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Endpoint</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3.5 font-bold text-emerald-400">GET</td>
                <td className="p-3.5 font-mono text-cyan-300">/api/v1/health</td>
                <td className="p-3.5">System status & microservice check</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">200 OK</span></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-blue-400">POST</td>
                <td className="p-3.5 font-mono text-cyan-300">/api/v1/scans/synthetic</td>
                <td className="p-3.5">Generates synthetic 3D Brain MRI volume</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">200 OK</span></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-emerald-400">GET</td>
                <td className="p-3.5 font-mono text-cyan-300">/api/v1/scans/:id/slice/:axis/:idx</td>
                <td className="p-3.5">Extracts 2D orthogonal slice matrix</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">200 OK</span></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-blue-400">POST</td>
                <td className="p-3.5 font-mono text-cyan-300">/api/v1/reconstruction/:id/mesh</td>
                <td className="p-3.5">Runs Marching Cubes GLB/STL generation</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">200 OK</span></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-emerald-400">GET</td>
                <td className="p-3.5 font-mono text-cyan-300">/api/v1/reports/:id/pdf</td>
                <td className="p-3.5">Generates ReportLab clinical PDF summary</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">200 OK</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CLI Quickstart */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" /> CLI Terminal Usage
        </h2>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <p className="text-slate-500"># Run headless batch pipeline from root directory:</p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
            python legacy/cli.py --iso-level 0.25 --output-dir storage/outputs
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Sliders, Camera, RotateCcw, Sparkles, Move3D } from 'lucide-react';

export interface BrainMesh3DProps {
  hasLesion?: boolean;
  wireframe?: boolean;
  opacity?: number;
  highlightTissue?: 'all' | 'gm' | 'wm' | 'csf' | 'lesion';
  exploded?: boolean;
}

export interface BrainCanvasProps {
  hasLesion?: boolean;
  opacity?: number;
  setOpacity?: React.Dispatch<React.SetStateAction<number>>;
  highlightTissue?: 'all' | 'gm' | 'wm' | 'csf' | 'lesion';
  setHighlightTissue?: React.Dispatch<React.SetStateAction<'all' | 'gm' | 'wm' | 'csf' | 'lesion'>>;
  exploded?: boolean;
  setExploded?: React.Dispatch<React.SetStateAction<boolean>>;
}

function BrainMesh3D({ wireframe, opacity, highlightTissue, hasLesion, exploded }: BrainMesh3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_state: any, delta: number) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const wmColor = highlightTissue === 'wm' ? '#3B82F6' : '#E2E8F0';
  const gmColor = highlightTissue === 'gm' ? '#10B981' : '#94A3B8';
  const csfColor = highlightTissue === 'csf' ? '#06B6D4' : '#334155';
  const lesionColor = '#EF4444';

  const expOffset = exploded ? 0.7 : 0.0;

  return (
    <group ref={groupRef}>
      {/* Outer Cortex / Grey Matter */}
      <mesh position={[0, expOffset, 0]}>
        <sphereGeometry args={[1.85, 36, 36]} />
        <meshStandardMaterial
          color={gmColor}
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.65}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Subcortical White Matter */}
      <mesh position={[0, -expOffset * 0.5, 0]} scale={[1.25, 1.45, 1.15]}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color={wmColor}
          wireframe={wireframe}
          transparent={true}
          opacity={(opacity ?? 0.8) * 0.9}
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>

      {/* Ventricular CSF Channels */}
      <mesh position={[-0.45 - expOffset, 0.2, 0]}>
        <torusGeometry args={[0.52, 0.13, 16, 32]} />
        <meshStandardMaterial
          color={csfColor}
          wireframe={wireframe}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.45 + expOffset, 0.2, 0]}>
        <torusGeometry args={[0.52, 0.13, 16, 32]} />
        <meshStandardMaterial
          color={csfColor}
          wireframe={wireframe}
          roughness={0.1}
        />
      </mesh>

      {/* Focal Pathology / Glioma Tumor */}
      {hasLesion && (
        <mesh position={[0.75 + expOffset * 0.8, -0.3, 0.5]}>
          <sphereGeometry args={[0.45, 28, 28]} />
          <meshStandardMaterial
            color={lesionColor}
            emissive={lesionColor}
            emissiveIntensity={0.7}
            wireframe={wireframe}
            roughness={0.15}
          />
        </mesh>
      )}
    </group>
  );
}

export default function BrainCanvas({
  hasLesion = true,
  opacity = 0.7,
  setOpacity,
  highlightTissue = 'all',
  setHighlightTissue,
  exploded = false,
  setExploded
}: BrainCanvasProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [localOpacity, setLocalOpacity] = useState(0.7);
  const [localExploded, setLocalExploded] = useState(false);
  const [localHighlight, setLocalHighlight] = useState<'all' | 'gm' | 'wm' | 'csf' | 'lesion'>('all');

  const activeOpacity = opacity !== undefined ? opacity : localOpacity;
  const activeExploded = exploded !== undefined ? exploded : localExploded;
  const activeHighlight = highlightTissue !== undefined ? highlightTissue : localHighlight;

  const handleOpacityChange = (val: number) => {
    setLocalOpacity(val);
    if (setOpacity) setOpacity(val);
  };

  const handleExplodedToggle = () => {
    const next = !activeExploded;
    setLocalExploded(next);
    if (setExploded) setExploded(next);
  };

  const handleHighlightSelect = (tissue: 'all' | 'gm' | 'wm' | 'csf' | 'lesion') => {
    setLocalHighlight(tissue);
    if (setHighlightTissue) setHighlightTissue(tissue);
  };

  const captureScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `3D_Brain_Screenshot_${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden glass-panel-glow border border-slate-800 shadow-2xl">
      {/* 3D R3F Canvas Viewport */}
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5.8]} fov={42} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[12, 12, 12]} intensity={1.4} />
        <directionalLight position={[-12, -12, -8]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[0, 3, 3]} intensity={0.9} color="#ef4444" />

        <Center>
          <BrainMesh3D
            hasLesion={hasLesion}
            wireframe={wireframe}
            opacity={activeOpacity}
            highlightTissue={activeHighlight}
            exploded={activeExploded}
          />
        </Center>

        <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1.2} enablePan={true} enableZoom={true} />
      </Canvas>

      {/* Floating Top Action Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" /> 3D Viewport Studio
          </span>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              wireframe
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 inline mr-1.5" />
            Wireframe
          </button>

          <button
            onClick={handleExplodedToggle}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeExploded
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Move3D className="w-3.5 h-3.5 inline mr-1.5" />
            {activeExploded ? 'Collapse Anatomy' : 'Exploded View'}
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              autoRotate
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
            Auto Rotation
          </button>
        </div>

        {/* Right Side Screenshot Button */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={captureScreenshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold transition-all"
            title="Capture HD Viewport Snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" /> Snapshot
          </button>
        </div>
      </div>

      {/* Floating Bottom Transparency & Tissue Highlights Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800 shadow-xl text-xs">
        {/* Transparency Control Slider */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">Cortex Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={activeOpacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOpacityChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <span className="font-mono text-cyan-400 text-xs w-10 text-right">{Math.round(activeOpacity * 100)}%</span>
        </div>

        {/* Tissue Color Highlights */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Highlight Region:</span>
          {[
            { id: 'all', label: '🧠 All Anatomy' },
            { id: 'gm', label: '🩶 Grey Matter' },
            { id: 'wm', label: '⚪ White Matter' },
            { id: 'csf', label: '💧 Brain Fluid' },
            { id: 'lesion', label: '🔴 Tumor Area' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleHighlightSelect(id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                activeHighlight === id
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

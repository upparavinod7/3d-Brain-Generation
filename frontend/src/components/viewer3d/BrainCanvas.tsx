'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import {
  Box,
  Sliders,
  Camera,
  RotateCcw,
  Sparkles,
  Move3D,
  Layers,
  Brain,
  Activity,
  Droplets,
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';
import { BACKEND_URL } from '@/lib/api';

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
  stlUrl?: string;
}

function createBrainHemisphereGeometry(side: 'left' | 'right') {
  const geo = new THREE.SphereGeometry(1.0, 64, 64);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    if (side === 'left') {
      x = Math.min(x * 0.95 - 0.05, 0.02);
    } else {
      x = Math.max(x * 0.95 + 0.05, -0.02);
    }

    y *= 1.45;
    z *= 1.1;

    if (y < 0.2 && z < 0) {
      x *= 1.15;
      z *= 1.08;
    }

    if (y > 0.4) {
      x *= 0.92;
    }

    if (y < -0.6) {
      x *= 0.85;
      z *= 0.9;
    }

    const wrinkle1 = Math.sin(x * 10.0) * Math.cos(y * 10.0) * Math.sin(z * 10.0) * 0.07;
    const wrinkle2 = Math.cos(x * 20.0 + y * 16.0) * Math.sin(z * 18.0) * 0.035;
    const wrinkle3 = Math.sin(x * 35.0 + z * 28.0) * 0.018;

    const displacement = 1.0 + wrinkle1 + wrinkle2 + wrinkle3;

    pos.setXYZ(i, x * displacement, y * displacement, z * displacement);
  }

  geo.computeVertexNormals();
  return geo;
}

function createCerebellumGeometry() {
  const geo = new THREE.SphereGeometry(0.55, 48, 48);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    x *= 1.4;
    y *= 0.75;
    z *= 0.75;

    const folia = Math.sin(z * 35.0) * 0.035 + Math.cos(x * 18.0) * 0.02;
    pos.setXYZ(i, x * (1.0 + folia), y * (1.0 + folia), z * (1.0 + folia));
  }
  geo.computeVertexNormals();
  return geo;
}

function createBrainstemGeometry() {
  const geo = new THREE.CylinderGeometry(0.24, 0.16, 0.85, 32);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let z = pos.getZ(i);
    let y = pos.getY(i);
    const curve = Math.sin((y + 0.42) * 3.2) * 0.07;
    pos.setZ(i, z + curve);
  }
  geo.computeVertexNormals();
  return geo;
}

function BrainMesh3D({ wireframe, opacity, highlightTissue, hasLesion, exploded }: BrainMesh3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  const leftGeo = React.useMemo(() => createBrainHemisphereGeometry('left'), []);
  const rightGeo = React.useMemo(() => createBrainHemisphereGeometry('right'), []);
  const cerebellumGeo = React.useMemo(() => createCerebellumGeometry(), []);
  const brainstemGeo = React.useMemo(() => createBrainstemGeometry(), []);

  useFrame((_state: any, delta: number) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const wmColor = highlightTissue === 'wm' ? '#3B82F6' : '#CBD5E1';
  const gmColor = highlightTissue === 'gm' ? '#10B981' : '#94A3B8';
  const csfColor = highlightTissue === 'csf' ? '#06B6D4' : '#475569';
  const lesionColor = '#EF4444';

  const expOffset = exploded ? 0.65 : 0.0;

  return (
    <group ref={groupRef} rotation={[0.2, 0, 0]}>
      {/* Left Cerebral Hemisphere */}
      <mesh geometry={leftGeo} position={[-expOffset * 0.8, 0.2, 0]}>
        <meshStandardMaterial
          color={gmColor}
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.7}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Right Cerebral Hemisphere */}
      <mesh geometry={rightGeo} position={[expOffset * 0.8, 0.2, 0]}>
        <meshStandardMaterial
          color={gmColor}
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.7}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Subcortical White Matter Core */}
      <mesh position={[0, 0.15 - expOffset * 0.4, 0]} scale={[0.82, 1.15, 0.85]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color={wmColor}
          wireframe={wireframe}
          transparent={true}
          opacity={(opacity ?? 0.8) * 0.85}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Cerebellum */}
      <mesh geometry={cerebellumGeo} position={[0, -0.6 - expOffset, -0.6]}>
        <meshStandardMaterial
          color={highlightTissue === 'gm' ? '#10B981' : '#64748B'}
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.85}
          roughness={0.5}
        />
      </mesh>

      {/* Brainstem */}
      <mesh geometry={brainstemGeo} position={[0, -0.9 - expOffset, -0.2]}>
        <meshStandardMaterial
          color="#475569"
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Ventricles */}
      <mesh position={[-0.35 - expOffset, 0.25, 0]}>
        <torusGeometry args={[0.42, 0.1, 16, 32]} />
        <meshStandardMaterial
          color={csfColor}
          wireframe={wireframe}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0.35 + expOffset, 0.25, 0]}>
        <torusGeometry args={[0.42, 0.1, 16, 32]} />
        <meshStandardMaterial
          color={csfColor}
          wireframe={wireframe}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Lesion Tumor */}
      {hasLesion && (
        <mesh position={[0.55 + expOffset * 0.8, 0.1, 0.35]}>
          <sphereGeometry args={[0.38, 28, 28]} />
          <meshStandardMaterial
            color={lesionColor}
            emissive={lesionColor}
            emissiveIntensity={0.8}
            wireframe={wireframe}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

function RealDicomBrainMesh({ url, wireframe, opacity }: { url: string; wireframe?: boolean; opacity?: number }) {
  const geometry = useLoader(STLLoader, url);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state: any, delta: number) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.10;
    }
  });

  useMemo(() => {
    if (geometry) {
      geometry.computeVertexNormals();
      geometry.center();
    }
  }, [geometry]);

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0.4, 0.2]} scale={[0.011, 0.011, 0.011]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#E89A8A"
          wireframe={wireframe}
          transparent={opacity !== undefined && opacity < 1.0}
          opacity={opacity ?? 1.0}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>
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
  setExploded,
  stlUrl = `${BACKEND_URL}/static/outputs/brain_3d_mesh.stl`
}: BrainCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState<'real_dicom' | 'anatomical'>('real_dicom');

  const [localOpacity, setLocalOpacity] = useState(0.7);
  const [localExploded, setLocalExploded] = useState(false);
  const [localHighlight, setLocalHighlight] = useState<'all' | 'gm' | 'wm' | 'csf' | 'lesion'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOpacity = opacity !== undefined ? opacity : localOpacity;
  const activeExploded = exploded !== undefined ? exploded : localExploded;
  const activeHighlight = highlightTissue !== undefined ? highlightTissue : localHighlight;

  if (!mounted) {
    return (
      <div className="relative w-full h-[640px] rounded-3xl overflow-hidden glass-panel-glow border border-slate-800 shadow-2xl bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-400">Loading 3D Viewport Studio...</p>
      </div>
    );
  }

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
    <div className="relative flex flex-col w-full h-[640px] rounded-3xl overflow-hidden glass-panel-glow border border-slate-800/90 shadow-2xl bg-slate-950">
      {/* Integrated Top Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> 3D Viewport Studio
          </span>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            {[
              { id: 'real_dicom', label: 'Realistic DICOM Surface' },
              { id: 'anatomical', label: 'Anatomical Layers' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === m.id
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              wireframe
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Wireframe Mesh"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            Wireframe
          </button>

          <button
            onClick={handleExplodedToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeExploded
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Exploded Anatomical View"
          >
            <Move3D className="w-3.5 h-3.5 text-indigo-400" />
            {activeExploded ? 'Collapse' : 'Exploded'}
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              autoRotate
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            Rotation
          </button>

          <button
            onClick={captureScreenshot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all shadow-md"
            title="Capture Viewport Screenshot"
          >
            <Camera className="w-3.5 h-3.5 fill-current" /> Snapshot
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport Area */}
      <div className="relative flex-1 w-full bg-slate-950">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)]" />

        {/* Orbit Control Instructions Badge */}
        <div className="absolute top-3 right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur border border-slate-800/80 text-[11px] text-slate-400 pointer-events-none">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left Drag to Rotate • Right Drag / Wheel to Zoom</span>
        </div>

        <Canvas gl={{ preserveDrawingBuffer: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5.8]} fov={42} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[12, 12, 12]} intensity={1.4} />
          <directionalLight position={[-12, -12, -8]} intensity={0.6} color="#38bdf8" />
          <pointLight position={[0, 3, 3]} intensity={0.9} color="#ef4444" />

          <Center>
            {viewMode === 'real_dicom' && (
              <React.Suspense
                fallback={
                  <BrainMesh3D
                    hasLesion={hasLesion}
                    wireframe={wireframe}
                    opacity={activeOpacity}
                    highlightTissue={activeHighlight}
                    exploded={activeExploded}
                  />
                }
              >
                <RealDicomBrainMesh url={stlUrl} wireframe={wireframe} opacity={activeOpacity} />
              </React.Suspense>
            )}
            {viewMode === 'anatomical' && (
              <BrainMesh3D
                hasLesion={hasLesion}
                wireframe={wireframe}
                opacity={activeOpacity}
                highlightTissue={activeHighlight}
                exploded={activeExploded}
              />
            )}
          </Center>

          <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1.2} enablePan={true} enableZoom={true} />
        </Canvas>
      </div>

      {/* Integrated Bottom Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 z-20 text-xs">
        {/* Opacity Control Slider */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-semibold shrink-0">Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={activeOpacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOpacityChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <span className="font-mono text-cyan-400 text-xs w-9 text-right font-bold">{Math.round(activeOpacity * 100)}%</span>
        </div>

        {/* Tissue Highlight Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Highlight:</span>
          {[
            { id: 'all', label: 'All Anatomy', icon: Brain, iconColor: 'text-cyan-400' },
            { id: 'gm', label: 'Grey Matter', icon: Activity, iconColor: 'text-emerald-400' },
            { id: 'wm', label: 'White Matter', icon: Layers, iconColor: 'text-slate-300' },
            { id: 'csf', label: 'Brain Fluid', icon: Droplets, iconColor: 'text-cyan-300' },
            { id: 'lesion', label: 'Tumor Area', icon: AlertTriangle, iconColor: 'text-rose-400' },
          ].map(({ id, label, icon: IconComponent, iconColor }) => (
            <button
              key={id}
              onClick={() => handleHighlightSelect(id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                activeHighlight === id
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold shadow-sm'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${activeHighlight === id ? 'text-slate-950' : iconColor}`} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

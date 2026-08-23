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

function createBrainHemisphereGeometry(side: 'left' | 'right') {
  const geo = new THREE.SphereGeometry(1.0, 64, 64);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Midline longitudinal fissure separation between left and right hemispheres
    if (side === 'left') {
      x = Math.min(x * 0.95 - 0.05, 0.02);
    } else {
      x = Math.max(x * 0.95 + 0.05, -0.02);
    }

    // Human brain cerebral hemisphere dimensions:
    // Elongated front-to-back (Y axis in R3F), wider X, slightly flattened Z
    y *= 1.45;
    z *= 1.1;

    // Temporal lobe inferolateral expansion
    if (y < 0.2 && z < 0) {
      x *= 1.15;
      z *= 1.08;
    }

    // Frontal lobe anterior rounding
    if (y > 0.4) {
      x *= 0.92;
    }

    // Occipital lobe posterior tapering
    if (y < -0.6) {
      x *= 0.85;
      z *= 0.9;
    }

    // Procedural Cortical Sulci & Gyri (Brain Wrinkles)
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

    x *= 1.4; // Transverse cerebellar width
    y *= 0.75; // Posterior-anterior compression
    z *= 0.75;

    // Cerebellar Folia (fine horizontal anatomical ridges)
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
    // Anterior ventral pons curvature
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

      {/* Cerebellum (Posterior Base of Brain) */}
      <mesh geometry={cerebellumGeo} position={[0, -0.6 - expOffset, -0.6]}>
        <meshStandardMaterial
          color={highlightTissue === 'gm' ? '#10B981' : '#64748B'}
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.85}
          roughness={0.5}
        />
      </mesh>

      {/* Brainstem (Inferior Medulla/Pons) */}
      <mesh geometry={brainstemGeo} position={[0, -0.9 - expOffset, -0.2]}>
        <meshStandardMaterial
          color="#475569"
          wireframe={wireframe}
          transparent={true}
          opacity={opacity ?? 0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Horn-Shaped Lateral Ventricles (CSF Cavities) */}
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

      {/* Focal Pathology / Glioma Tumor Mass */}
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

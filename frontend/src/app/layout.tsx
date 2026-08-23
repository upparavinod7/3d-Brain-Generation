import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ParticleBackground from '@/components/ui/ParticleBackground';

export const metadata: Metadata = {
  title: 'NeuroForge | AI-Powered 3D Brain Platform',
  description: 'A premium AI-powered platform for medical imaging, 3D brain reconstruction, segmentation, and review.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950 text-slate-100 antialiased">
        {/* Ambient Background Lights */}
        <div className="pointer-events-none fixed top-0 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="pointer-events-none fixed top-1/3 right-10 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="pointer-events-none fixed bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[120px]" />

        <ParticleBackground />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}


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
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-slate-950 text-slate-100">
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

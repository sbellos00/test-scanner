/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { fetchActiveUrl } from '@/lib/api';
import '@/scanner-files/styles.css';

// Dynamically import the AFrameScene component with no SSR
const DynamicAFrameScene = dynamic(
  () => import('../../components/AFrameScene'),
  { ssr: false }
);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-camera': any;
      'a-entity': any;
    }
  }
  
  interface Window {
    AFRAME: any;
    mindar: any;
  }
}

export default function NewScannerPage() {
  const [arSystem, setARSystem] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Wrapper function to handle loading state
  const handleTargetFound = async (target: string) => {
    setIsLoading(true);
    try {
      const activeUrl = await fetchActiveUrl(target);
      window.location.href = activeUrl;
    } catch (error) {
      console.error('Error handling target found:', error);
      window.location.href = 'https://hyperspace.digital/error';
    } finally {
      setIsLoading(false);
    }
  };

  // Define custom targets and their behaviors
  const customTargets = [
    {
      id: 'hyperspace-labs',
      index: 0,
      onTargetFound: () => handleTargetFound('hyperspace-labs')
    },
    {
      id: 'calendar-plaisio',
      index: 1,
      onTargetFound: () => handleTargetFound('calendar-plaisio')
    },
    {
      id: 'mamba-mentality',
      index: 2,
      onTargetFound: () => handleTargetFound('mamba-mentality')
    }
  ];

  const handleSceneLoaded = (system: any) => {
    setARSystem(system);
  };

  const startScanning = () => {
    if (arSystem) {
      arSystem.start();
      setIsScanning(true);
    }
  };

  const stopScanning = () => {
    if (arSystem) {
      arSystem.stop();
      setIsScanning(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (arSystem) {
        arSystem.stop();
      }
    };
  }, [arSystem]);

  // Auto-start scanning on component mount
  useEffect(() => {
    if (arSystem) {
      startScanning();
    }
  }, [arSystem]);

  return (
    <div className="scanner-page">
      <div id="loadingAnimation" className="animation-container">
        <video id="enterUtopiaVideo" autoPlay muted loop playsInline>
          <source src="/gnxscannerloadingscreen.mp4" type="video/mp4" />
        </video>
      </div>
      
      <div id="scannerAnimation" className="animation-container hidden">
        <video id="portalScannerVideo" autoPlay muted loop playsInline>
          <source src="/portalScanner.mp4" type="video/mp4" />
        </video>
      </div>
      
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white">Redirecting...</div>
        </div>
      )}
      
      <div className="scanner-container">
        <DynamicAFrameScene 
          onSceneLoaded={handleSceneLoaded}
          mindFilePath="/targets.mind" 
          targets={customTargets}
        />
        
        <div className="scanner-controls mt-4">
          {!isScanning ? (
            <button 
              onClick={startScanning}
              className="scan-button"
            >
              Start Scanning
            </button>
          ) : (
            <button 
              onClick={stopScanning}
              className="stop-button"
            >
              Stop Scanning
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from 'react';

interface AFrameSceneProps {
  onSceneLoaded: (system: any) => void;
  mindFilePath: string;
  targets: {
    id: string;
    index: number;
    onTargetFound?: () => void;
  }[];
}

declare global {
  interface Window {
    AFRAME: any;
    mindar: any;
  }
}

export default function AFrameScene({ onSceneLoaded, mindFilePath, targets }: AFrameSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAFrameReady, setIsAFrameReady] = useState(false);
  const [isMindARReady, setIsMindARReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Increased for more patience

  // Check if scripts are loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScriptsLoaded = () => {
      // Check if A-Frame is loaded
      const aframeLoaded = 'AFRAME' in window && typeof window.AFRAME === 'object';
      
      // Check if MindAR is loaded
      const mindarLoaded = 'mindar' in window && typeof window.mindar === 'object';
      
      if (aframeLoaded !== isAFrameReady) {
        setIsAFrameReady(aframeLoaded);
      }
      
      if (mindarLoaded !== isMindARReady) {
        setIsMindARReady(mindarLoaded);
      }

      // If not loaded and under max retries, try again
      if ((!aframeLoaded || !mindarLoaded) && retryCount < maxRetries) {
        const nextRetryDelay = Math.min(1000 * Math.pow(1.5, retryCount), 10000); // Exponential backoff
        console.log(`Waiting for scripts to load... Retry ${retryCount + 1}/${maxRetries} in ${nextRetryDelay}ms`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, nextRetryDelay);
      } else if (retryCount >= maxRetries && (!aframeLoaded || !mindarLoaded)) {
        const missingLibs = [];
        if (!aframeLoaded) missingLibs.push('A-Frame');
        if (!mindarLoaded) missingLibs.push('MindAR');
        
        setError(`Failed to load required scripts: ${missingLibs.join(', ')}. Please check your internet connection and refresh the page.`);
      }
    };

    // Start checking if scripts are loaded
    checkScriptsLoaded();
  }, [retryCount, isAFrameReady, isMindARReady]);

  // Initialize A-Frame scene when scripts are ready
  useEffect(() => {
    if (!isAFrameReady || !isMindARReady || !containerRef.current) {
      return;
    }

    try {
      // Create A-Frame scene element
      const sceneEl = document.createElement('a-scene');
      sceneEl.setAttribute('mindar-image', `imageTargetSrc: ${mindFilePath}; uiLoading:#loadingAnimation; uiScanning:#scannerAnimation; autoStart: false`);
      sceneEl.setAttribute('color-space', 'sRGB');
      sceneEl.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
      sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
      sceneEl.setAttribute('device-orientation-permission-ui', 'enabled: false');

      // Create assets
      const assets = document.createElement('a-assets');
      const assetItem = document.createElement('a-asset-item');
      assetItem.id = 'avatarModel';
      assetItem.setAttribute('src', 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/softmind/scene.gltf');
      assets.appendChild(assetItem);
      sceneEl.appendChild(assets);

      // Create camera
      const camera = document.createElement('a-camera');
      camera.setAttribute('position', '0 0 0');
      camera.setAttribute('look-controls', 'enabled: false');
      sceneEl.appendChild(camera);

      // Create entities for targets
      targets.forEach((target) => {
        const entity = document.createElement('a-entity');
        entity.id = target.id;
        entity.setAttribute('mindar-image-target', `targetIndex: ${target.index}`);
        
        // Add event listener for target found
        entity.addEventListener('targetFound', () => {
          if (target.onTargetFound) {
            target.onTargetFound();
          }
        });
        
        sceneEl.appendChild(entity);
      });

      // Clean container and append scene
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(sceneEl);

      // Set up scene loaded event
      sceneEl.addEventListener('loaded', () => {
        try {
          // Use proper type assertion
          const sceneWithSystems = sceneEl as unknown as {
            systems: { [key: string]: any }
          };
          
          const system = sceneWithSystems.systems["mindar-image-system"];
          if (system) {
            onSceneLoaded(system);
          } else {
            setError('Could not find mindar-image-system. AR functionality may not work properly.');
          }
        } catch (err) {
          setError(`Error initializing AR system: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
    } catch (err) {
      setError(`Error creating AR scene: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isAFrameReady, isMindARReady, onSceneLoaded, mindFilePath, targets]);

  return (
    <div>
      {error && <div className="ar-error-message">{error}</div>}
      <div ref={containerRef} id="scene-container" className="ar-scene-container"></div>
    </div>
  );
} 
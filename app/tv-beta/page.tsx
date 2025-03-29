/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
"use client";

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import '@/scanner-files/styles.css';
import { fetchActiveUrl } from '@/lib/api';

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
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to play intro video when provided
  const playIntroVideo = (videoUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      // Create modal container
      const modal = document.createElement('div');
      modal.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black z-50';
      
      // Create video element
      const video = document.createElement('video');
      video.className = 'w-full h-full object-contain'; // Full screen with proper aspect ratio
      video.src = videoUrl;
      video.controls = false;
      video.muted = true; // Start muted to help with autoplay
      video.playsInline = true; // Important for mobile
      
      // When video ends, resolve the promise
      video.onended = () => {
        document.body.removeChild(modal);
        resolve();
      };

      // Add elements to DOM
      modal.appendChild(video);
      document.body.appendChild(modal);
      
      // Force play with retry mechanism
      const playVideo = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Intro video started playing');
            // Unmute after successful play start (if browser allows)
            setTimeout(() => {
              video.muted = false;
            }, 500);
          }).catch(error => {
            console.warn('Autoplay was prevented:', error);
            // Retry after a short delay
            setTimeout(playVideo, 1000);
          });
        }
      };
      
      playVideo();
    });
  };
  
  // Wrapper function to handle loading state
  const handleTargetFound = async (target: string) => {
    setIsLoading(true);
    try {
      const urlData = await fetchActiveUrl(target);

      // If intro video exists, hide loading overlay first, then play intro
      if (urlData.introVideo) {
        setIsLoading(false); // Hide loading overlay before playing intro video
        await playIntroVideo(urlData.introVideo);
      }

      // Redirect to the main URL
      window.location.href = urlData.url;
    } catch (error) {
      console.error('Error handling target found:', error);
      window.location.href = 'https://hyperspace.digital/error';
    } finally {
      setIsLoading(false); // Ensure loading is always turned off in case of errors
    }
  };
  
  useEffect(() => {
    // This code runs after the component mounts and all scripts load
    if (typeof window !== 'undefined') {
      // Inject A-Frame HTML
      if (sceneContainerRef.current) {
        const aframeHTML = `
          <a-scene
            mindar-image="imageTargetSrc: /targets.mind; uiLoading:#loadingAnimation; uiScanning:#scannerAnimation; autoStart: true"
            color-space="sRGB" 
            renderer="colorManagement: true, physicallyCorrectLights" 
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
          >
            <a-assets>
              <a-asset-item 
                id="avatarModel"
                src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/softmind/scene.gltf"
              ></a-asset-item>
            </a-assets>
            
            <a-camera position="0 0 0" look-controls="enabled: false" exposure="1.2" auto-exposure="true"></a-camera>
            
            <a-entity id="hyperspace-labs" mindar-image-target="targetIndex: 0"></a-entity>
            <a-entity id="calendar-plaisio" mindar-image-target="targetIndex: 1"></a-entity>
            <a-entity id="mamba-mentality" mindar-image-target="targetIndex: 2"></a-entity>
          </a-scene>
        `;
        
        sceneContainerRef.current.innerHTML = aframeHTML;
      }
      
      // Wait for a short delay to ensure scene is initialized
      const initTimeout = setTimeout(() => {
        // Setup target event listeners
        const targets = [
          'hyperspace-labs', 'calendar-plaisio', 'mamba-mentality'
        ];
        
        targets.forEach(target => {
          const element = document.querySelector(`#${target}`);
          if (element) {
            element.addEventListener("targetFound", () => {
              handleTargetFound(target);
            });
          }
        });
        
        // Attempt to play videos for animations
        const attemptPlay = (video: HTMLVideoElement) => {
          if (!video) return;
          
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Autoplay started
            }).catch(error => {
              console.warn('Autoplay was prevented. Attempting to play the video manually.', error);
            });
          }
        };
        
        const enterUtopiaVideo = document.getElementById('enterUtopiaVideo') as HTMLVideoElement;
        const portalScannerVideo = document.getElementById('portalScannerVideo') as HTMLVideoElement;
        
        if (enterUtopiaVideo) attemptPlay(enterUtopiaVideo);
        if (portalScannerVideo) attemptPlay(portalScannerVideo);
      }, 1000);
      
      return () => clearTimeout(initTimeout);
    }
  }, []);
  
  return (
    <>
      <Script src="https://aframe.io/releases/1.6.0/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js" strategy="beforeInteractive" />
      
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
          <img src="/ONtinosOMitoglou.png" alt="Loading" className="max-w-full max-h-full" />
        </div>
      )}
      
      <div ref={sceneContainerRef} id="scene-container" className="ar-scene-container"></div>
    </>
  );
} 
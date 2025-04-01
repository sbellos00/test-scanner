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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // Helper function to log both to console and to UI for mobile debugging
  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-10), message]); // Keep last 10 messages
  };
  
  // Function to play intro video when provided
  const playIntroVideo = (videoUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      // Preload the background image
      const preloadImage = new Image();
      preloadImage.src = 'https://res.cloudinary.com/dawyrpt2m/image/upload/v1743421018/Screenshot_2025-03-31_143549_dwhfs4.png';
      
      logDebug('Starting intro video playback');
      
      // Create modal container with transparent background first
      const modal = document.createElement('div');
      modal.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black z-50';
      
      // Create video element with modified CSS classes
      const video = document.createElement('video');
      video.className = 'w-full h-full relative z-10 object-contain';
      video.muted = true; // Keep video muted for autoplay
      video.playsInline = true;
      video.playbackRate = 1.0; // Ensure playback rate is standard
      video.crossOrigin = "anonymous"; // Try to avoid CORS issues
      video.preload = 'auto';
      
      // Add debugging for video
      video.addEventListener('loadedmetadata', () => {
        logDebug(`Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
      });
      
      video.addEventListener('error', () => {
        const errorMessage = `Video error: ${video.error?.code || 'unknown'} - ${video.error?.message || 'No message'}`;
        logDebug(errorMessage);
        // If video fails, continue with redirect
        resolve();
      });
      
      // Create unmute button (defined early so it can be referenced in handlers)
      const unmuteButton = document.createElement('button');
      unmuteButton.textContent = 'Tap Anywhere';
      unmuteButton.className = 'absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-70 text-black py-2 px-4 rounded-full z-20';
      
      // Add user interaction handler to unmute video
      const unmuteVideo = () => {
        // Try to unmute video after user interaction
        video.muted = false;
        logDebug('Video unmuted via user interaction');
        
        // Hide the unmute button
        if (unmuteButton.parentNode) {
          unmuteButton.style.display = 'none';
        }
        
        // Remove event listeners
        document.removeEventListener('click', unmuteVideo);
        document.removeEventListener('touchstart', unmuteVideo);
      };
      
      // Listen for user interactions to unmute
      document.addEventListener('click', unmuteVideo);
      document.addEventListener('touchstart', unmuteVideo);
      
      // When video ends, show full background overlay
      video.onended = () => {
        logDebug('Video ended, preparing for redirect');
        // Remove the video modal
        document.body.removeChild(modal);
        
        // Create a new full-screen background overlay that will persist during redirect
        const backgroundOverlay = document.createElement('div');
        backgroundOverlay.className = 'fixed top-0 left-0 w-full h-full bg-black z-[9999]';
        
        // Add background image (using the preloaded image src)
        const backgroundImg = document.createElement('img');
        backgroundImg.src = preloadImage.src;
        backgroundImg.className = 'w-full h-full object-cover';
        
        // Add a solid color background as fallback in case image still loading
        backgroundOverlay.style.backgroundColor = '#000000';
        backgroundOverlay.appendChild(backgroundImg);
        
        // Add to body
        document.body.appendChild(backgroundOverlay);
        
        // Clean up event listeners
        document.removeEventListener('click', unmuteVideo);
        document.removeEventListener('touchstart', unmuteVideo);
        
        // Continue with redirect
        resolve();
      };
      
      // Add elements to DOM: Add modal, then video
      modal.appendChild(video);
      modal.appendChild(unmuteButton);
      document.body.appendChild(modal);
      logDebug('Modal with video added to DOM');
      
      // Set video source *after* adding to DOM to potentially help iOS
      video.src = videoUrl;
      logDebug(`Video source set: ${videoUrl}`);
      
      // Attempt to play the video as soon as possible
      const playMedia = () => {
        logDebug(`Attempting to play video (readyState: ${video.readyState})`);
        const videoPromise = video.play();
        
        if (videoPromise !== undefined) {
          videoPromise.then(() => {
            logDebug('Video playing successfully (muted)');
          }).catch(error => {
            logDebug(`Autoplay prevented: ${error}. Waiting for user interaction.`);
            // Ensure unmute button is visible if autoplay fails
            unmuteButton.textContent = 'Tap to Play';
            unmuteButton.style.display = 'block';
          });
        } else {
          logDebug('video.play() did not return a promise. Autoplay likely blocked.');
          // Ensure unmute button is visible
          unmuteButton.textContent = 'Tap to Play';
          unmuteButton.style.display = 'block';
        }
      };
      
      // Check initial ready state and try to play, otherwise wait for 'canplay'
      if (video.readyState >= video.HAVE_FUTURE_DATA) { // HAVE_FUTURE_DATA = 3
        playMedia();
      } else {
        logDebug('Video not ready yet, waiting for canplay event');
        video.addEventListener('canplay', () => {
          logDebug('Video canplay event fired');
          playMedia();
        }, { once: true });
      }
      
      // Optional: A final safety timeout to resolve if nothing happens
      const safetyTimeout = setTimeout(() => {
        logDebug(`Safety timeout reached. Current readyState: ${video.readyState}`);
        // Check if modal still exists (might have been removed by onended)
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        resolve();
      }, 10000); // 10 seconds
      
      // Ensure safety timeout is cleared when video ends or resolves
      video.addEventListener('ended', () => clearTimeout(safetyTimeout), { once: true });
      video.addEventListener('error', () => clearTimeout(safetyTimeout), { once: true });
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
      // Log device info for debugging
      logDebug(`Device: ${navigator.userAgent}`);
      
      // Log video element support
      try {
        const testVideo = document.createElement('video');
        logDebug(`Browser video support: ${!!testVideo.canPlayType}`);
        logDebug(`MP4 support: ${testVideo.canPlayType('video/mp4')}`);
      } catch (err) {
        logDebug(`Error testing video support: ${err}`);
      }
      
      // Inject A-Frame HTML
      if (sceneContainerRef.current) {
        logDebug('Initializing AR scene');
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
        logDebug('AR scene initialized');
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
        
        // Attempt to play videos for animations with improved error handling
        const attemptPlay = (video: HTMLVideoElement) => {
          if (!video) return;
          
          // Add error tracking for debugging
          video.addEventListener('error', () => {
            logDebug(`Animation video error: ${video.error?.code || 'unknown'} - ${video.error?.message || 'No message'}`);
          });
          
          // Function that checks readyState and attempts to play
          const tryPlay = () => {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA = 2
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  logDebug(`Animation video ID=${video.id} started playing`);
                }).catch(error => {
                  logDebug(`Animation autoplay prevented for ${video.id}: ${error}`);
                  
                  // Retry after user interaction
                  const handleUserInteraction = () => {
                    video.play().catch(err => {
                      logDebug(`Failed to play ${video.id} after user interaction: ${err}`);
                    });
                    
                    // Remove event listeners after attempt
                    document.removeEventListener('click', handleUserInteraction);
                    document.removeEventListener('touchstart', handleUserInteraction);
                  };
                  
                  // Add listeners for user interaction
                  document.addEventListener('click', handleUserInteraction, { once: true });
                  document.addEventListener('touchstart', handleUserInteraction, { once: true });
                });
              }
            } else {
              // Wait for canplay event if not ready
              video.addEventListener('canplay', tryPlay, { once: true });
              
              // Set a timeout to retry anyway
              setTimeout(() => {
                if (video.readyState < 2) {
                  logDebug(`${video.id} still not ready (readyState: ${video.readyState}), trying anyway`);
                  video.play().catch(e => logDebug(`Play attempt failed for ${video.id}: ${e}`));
                }
              }, 3000);
            }
          };
          
          // Start the process
          if (video.readyState >= 2) {
            tryPlay();
          } else {
            video.addEventListener('canplay', tryPlay, { once: true });
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
        <video 
          id="enterUtopiaVideo" 
          autoPlay 
          muted 
          loop 
          playsInline
          style={{ objectFit: "fill", width: "100%", height: "100%" }}
          preload="auto"
          poster="https://res.cloudinary.com/dawyrpt2m/image/upload/v1743421018/Screenshot_2025-03-31_143549_dwhfs4.png"
        >
          <source src="/gnxscannerloadingscreen.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div id="scannerAnimation" className="animation-container hidden">
        <video 
          id="portalScannerVideo" 
          autoPlay 
          muted 
          loop 
          playsInline
          style={{ objectFit: "fill", width: "100%", height: "100%" }}
          preload="auto"
        >
          <source src="/portalScanner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <img src="https://res.cloudinary.com/dawyrpt2m/image/upload/v1743421018/Screenshot_2025-03-31_143549_dwhfs4.png" alt="Loading" className="max-w-full max-h-full" />
        </div>
      )}
      
      {/* Mobile debug overlay */}
      {showDebug && (
        <div className="fixed top-0 left-0 w-full bg-black bg-opacity-80 text-white p-4 z-[9999] text-xs overflow-auto" style={{ maxHeight: '60vh' }}>
          <h3 className="text-sm font-bold mb-2">Debug Info:</h3>
          <ul>
            {debugInfo.map((msg, i) => (
              <li key={i} className="my-1 border-b border-gray-700 pb-1">{msg}</li>
            ))}
          </ul>
          <div className="mt-2">
            <span className="text-xs text-gray-400">Device: {navigator.userAgent}</span>
          </div>
        </div>
      )}
      
      {/* Debug toggle button */}
      <button 
        onClick={() => setShowDebug(!showDebug)} 
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center z-[9999] opacity-50 hover:opacity-100"
      >
        {showDebug ? 'X' : 'D'}
      </button>
      
      <div ref={sceneContainerRef} id="scene-container" className="ar-scene-container"></div>
    </>
  );
} 
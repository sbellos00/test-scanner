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
      
      // Check if the device is a Xiaomi phone with Chrome
      const isXiaomiChrome = /xiaomi|mi/i.test(navigator.userAgent.toLowerCase()) && /chrome/i.test(navigator.userAgent.toLowerCase());
      logDebug(`Xiaomi Chrome detected: ${isXiaomiChrome}`);
      
      // If Xiaomi with Chrome is detected, use alternative fallback approach
      if (isXiaomiChrome) {
        logDebug('Using fallback image-based experience for Xiaomi device');
        // Create a full-screen overlay with background image instead of video
        const fallbackOverlay = document.createElement('div');
        fallbackOverlay.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black z-50';
        
        // Add background image as the visual
        const img = document.createElement('img');
        img.src = preloadImage.src;
        img.className = 'w-full h-full object-cover';
        fallbackOverlay.appendChild(img);
        
        // Add a message about the redirection
        const redirectMsg = document.createElement('div');
        redirectMsg.textContent = 'Redirecting you in 3 seconds...';
        redirectMsg.className = 'absolute bottom-10 left-0 w-full text-center text-white text-lg font-bold';
        fallbackOverlay.appendChild(redirectMsg);
        
        // Add to body
        document.body.appendChild(fallbackOverlay);
        
        // Create audio element to play just the audio
        const audio = document.createElement('audio');
        audio.src = videoUrl;
        audio.autoplay = true;
        fallbackOverlay.appendChild(audio);
        
        // Set a timeout equal to video duration
        setTimeout(() => {
          document.body.removeChild(fallbackOverlay);
          resolve();
        }, 3000); // Adjust this time to match your intro video duration
        
        return; // Skip the rest of the function
      }
      
      // Create modal container with transparent background first
      const modal = document.createElement('div');
      modal.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center z-50';
      
      // Create video element with modified CSS classes
      const video = document.createElement('video');
      video.className = 'w-full h-full relative z-10'; // Removed object-contain
      video.muted = true; // Keep video muted for autoplay
      video.playsInline = true;
      video.playbackRate = 1.0; // Ensure playback rate is standard
      video.crossOrigin = "anonymous"; // Try to avoid CORS issues
      
      // Add an explicit poster for video
      video.poster = preloadImage.src;
      
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
      
      // Add elements to DOM: Add modal first
      document.body.appendChild(modal);
      logDebug('Modal added to DOM');
      
      // Add a small delay before adding video to ensure DOM is ready
      setTimeout(() => {
        // Set the black background after a small delay to ensure video renders first
        modal.style.backgroundColor = 'black';
        
        // Add video to modal
        modal.appendChild(video);
        logDebug('Video element added to modal');
        
        // Add button click handler and append to modal
        unmuteButton.onclick = (e) => {
          e.stopPropagation();
          unmuteVideo();
        };
        modal.appendChild(unmuteButton);
        
        // Set video source after adding to DOM
        video.src = videoUrl;
        logDebug(`Video source set: ${videoUrl}`);
      }, 50);
      
      // Enhanced playMedia function with readyState checks
      const playMedia = () => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA = 2
          logDebug(`Playing video with readyState: ${video.readyState}`);
          // Play video
          const videoPromise = video.play();
          if (videoPromise !== undefined) {
            videoPromise.then(() => {
              logDebug('Video playing successfully');
            }).catch(error => {
              logDebug(`Autoplay prevented: ${error}`);
              // Add a user interaction hint if autoplay fails
              unmuteButton.textContent = 'Tap to Play';
              unmuteButton.style.display = 'block';
            });
          }
        } else {
          logDebug(`Video not ready yet (readyState: ${video.readyState}), waiting for canplay`);
          // Try again when video can play
          video.addEventListener('canplay', () => {
            logDebug('Video can now play via canplay event');
            playMedia();
          }, { once: true });
          
          // Set a timeout in case canplay never fires
          setTimeout(() => {
            if (video.readyState < 2) {
              logDebug(`Video still not ready after timeout (readyState: ${video.readyState})`);
              resolve();
            }
          }, 5000);
        }
      };
      
      // Listen for canplay event to start playing
      video.addEventListener('canplay', () => {
        logDebug('Video canplay event fired');
        playMedia();
      }, { once: true });
      
      // Set a timeout to ensure we don't wait forever
      setTimeout(() => {
        if (video.readyState < 2) {
          logDebug(`Timeout reached, video readyState: ${video.readyState}`);
          resolve();
        }
      }, 8000);
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
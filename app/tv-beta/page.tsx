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
      // Preload the background image
      const preloadImage = new Image();
      preloadImage.src = 'https://res.cloudinary.com/dawyrpt2m/image/upload/v1743421018/Screenshot_2025-03-31_143549_dwhfs4.png';
      
      // Create modal container with transparent background first
      const modal = document.createElement('div');
      modal.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center z-50';
      
      // Create video element with modified CSS classes
      const video = document.createElement('video');
      video.className = 'w-full h-full relative z-10'; // Removed object-contain
      video.muted = true; // Keep video muted for autoplay
      video.playsInline = true;
      video.playbackRate = 1.0; // Ensure playback rate is standard
      
      // Add an explicit poster for video
      video.poster = preloadImage.src;
      
      // Add debugging for video
      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
      });
      
      video.addEventListener('error', (e) => {
        console.error('Video error:', video.error?.code, video.error?.message);
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
      
      // Add a small delay before adding video to ensure DOM is ready
      setTimeout(() => {
        // Set the black background after a small delay to ensure video renders first
        modal.style.backgroundColor = 'black';
        
        // Add video to modal
        modal.appendChild(video);
        
        // Add button click handler and append to modal
        unmuteButton.onclick = (e) => {
          e.stopPropagation();
          unmuteVideo();
        };
        modal.appendChild(unmuteButton);
        
        // Set video source after adding to DOM
        video.src = videoUrl;
      }, 50);
      
      // Enhanced playMedia function with readyState checks
      const playMedia = () => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA = 2
          // Play video
          const videoPromise = video.play();
          if (videoPromise !== undefined) {
            videoPromise.then(() => {
              console.log('Intro video started playing successfully');
            }).catch(error => {
              console.warn('Video autoplay was prevented:', error);
              // Add a user interaction hint if autoplay fails
              unmuteButton.textContent = 'Tap to Play';
              unmuteButton.style.display = 'block';
            });
          }
        } else {
          console.log('Video not ready yet, waiting for canplay event');
          // Try again when video can play
          video.addEventListener('canplay', () => {
            console.log('Video can now play, attempting playback');
            playMedia();
          }, { once: true });
          
          // Set a timeout in case canplay never fires
          setTimeout(() => {
            if (video.readyState < 2) {
              console.warn('Video still not ready after timeout, continuing anyway');
              resolve();
            }
          }, 5000);
        }
      };
      
      // Listen for canplay event to start playing
      video.addEventListener('canplay', () => {
        playMedia();
      }, { once: true });
      
      // Set a timeout to ensure we don't wait forever
      setTimeout(() => {
        if (video.readyState < 2) {
          console.warn('Video not ready after timeout, continuing anyway');
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
        
        // Attempt to play videos for animations with improved error handling
        const attemptPlay = (video: HTMLVideoElement) => {
          if (!video) return;
          
          // Add error tracking for debugging
          video.addEventListener('error', (e) => {
            console.error('Video error in attemptPlay:', video.error?.code, video.error?.message);
          });
          
          // Function that checks readyState and attempts to play
          const tryPlay = () => {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA = 2
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  console.log('Animation video started playing');
                }).catch(error => {
                  console.warn('Animation autoplay was prevented:', error);
                  
                  // Retry after user interaction
                  const handleUserInteraction = () => {
                    video.play().catch(err => {
                      console.error('Failed to play after user interaction:', err);
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
                  console.warn('Video still not ready, trying anyway');
                  video.play().catch(e => console.warn('Play attempt failed:', e));
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
      
      <div ref={sceneContainerRef} id="scene-container" className="ar-scene-container"></div>
    </>
  );
} 
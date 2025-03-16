# HyperSpace Scanner

This is an AR scanner component that uses A-Frame and MindAR to create an augmented reality experience.

## Setup

1. Make sure to copy all the required assets to the public folder:
   - NtinosMitoglou.png
   - EtsiEinaiHFash.png
   - gnxscannerloadingscreen.mp4
   - portalScanner.mp4
   - dollah.mind
   - BeautiqueDisplay-Bold.woff2
   - BeautiqueDisplay-Medium.woff2
   - Migra-Extrabold.woff2 (if available)

## Usage

The scanner is accessible at the `/scanner` route. It provides an AR experience that:

1. Shows a loading screen with a video
2. Allows users to start the AR experience by clicking the "enter" button
3. Uses the device camera to scan for specific targets (dollar bills)
4. When a target is found, it redirects to a Spotify album

## Customization

You can customize the scanner by:

1. Changing the target images in the dollah.mind file
2. Updating the redirect URLs in the target event listeners
3. Modifying the UI elements and styling in the styles.css file

## Troubleshooting

- If the camera doesn't start, make sure you're accessing the site over HTTPS
- If the AR experience doesn't work, check that all assets are properly loaded
- For mobile devices, ensure that camera permissions are granted 
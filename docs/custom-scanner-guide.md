# Custom Scanner Implementation Guide

This guide explains how to use the new custom scanner page with your own target images.

## How It Works

The `app/new-scanner/page.tsx` provides a second scanner page that works exactly like the original scanner but with different target images.

## Setting Up Custom Target Images

1. **Create a .mind file for your target images**
   - Use the MindAR Image Compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile/
   - Upload your target images
   - Compile them
   - Download the resulting `.mind` file
   - Place it in your `/public` folder as `custom-targets.mind` (or change the path in the code)

2. **Configure the targets in the code**
   - Open `app/new-scanner/page.tsx`
   - Update the `customTargets` array with your target configurations:

   ```typescript
   const customTargets = [
     {
       id: 'customTarget1',  // A unique ID for the target
       index: 0,             // The order in the .mind file (first image = 0)
       onTargetFound: () => handleTargetFound('customTarget1')
     },
     // Add more targets as needed
   ];
   ```

   - Make sure the `index` values match the order of images in your `.mind` file
   - The `id` values should match the identifiers in your database

## Database Integration

The `handleTargetFound` function calls `fetchActiveUrl(target)` which should:

1. Make an API request to your backend
2. Look up the current active URL for the target in your database/KV store
3. Return the URL for redirection

## Adding New Scanners

If you need additional scanners with different target images:

1. Copy the `app/new-scanner` folder and rename it (e.g., `app/product-scanner`)
2. Create a new `.mind` file for those targets
3. Update the path in the code: `mindFilePath="/product-targets.mind"`
4. Update the targets array with appropriate IDs and indices

## Testing Your Scanner

1. Generate a `.mind` file with your target images
2. Place it in `/public`
3. Update the `customTargets` array in the code
4. Run the app and navigate to `/new-scanner`
5. Point your camera at one of your target images
6. The app should recognize it and redirect to the configured URL 
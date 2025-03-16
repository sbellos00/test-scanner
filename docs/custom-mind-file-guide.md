# Creating Custom MindAR Target Files (.mind)

This guide explains how to create custom `.mind` files for use with the HyperSpace Scanner.

## What are .mind files?

`.mind` files are compiled image data that MindAR uses for image tracking and recognition. Each `.mind` file can contain multiple target images.

## Requirements

- Images should have good contrast and distinctive features
- Avoid highly repetitive patterns
- Image size should be reasonable (recommended 512px to 1024px width)
- PNG or JPG format works best

## Creating a .mind file

There are two ways to create `.mind` files:

### Option 1: Using the MindAR Online Compiler (Easiest)

1. Go to the [MindAR Image Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
2. Upload your target images (you can add multiple images)
3. Click "Start Compile"
4. Once complete, download the compiled `.mind` file
5. Place the file in your project's public folder (e.g., `/public/custom-targets.mind`)

### Option 2: Using the Command Line

If you need more control, you can use the MindAR CLI:

1. Install the MindAR CLI:
   ```bash
   npm install -g @mindar/cli
   ```

2. Create a directory with your target images

3. Run the compiler:
   ```bash
   mindar-cli compile /path/to/images-directory /path/to/output.mind
   ```

4. Place the generated `.mind` file in your project's public folder

## Testing Your .mind File

1. Before implementing in your scanner, it's recommended to test your `.mind` file using the [MindAR testing tool](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
2. Click on "Test Compiled Mind File"
3. Upload your `.mind` file and test with your target images

## Using Your Custom .mind File

In your scanner component:

```tsx
<DynamicAFrameScene 
  onSceneLoaded={handleSceneLoaded}
  mindFilePath="/custom-targets.mind" 
  targets={customTargets}
/>
```

Where `customTargets` is an array of your target configurations:

```tsx
const customTargets = [
  {
    id: 'target1',  // A unique ID for this target
    index: 0,       // The index of this target in the .mind file (first image = 0, second = 1, etc.)
    onTargetFound: () => {
      window.location.href = "https://example.com/target1-destination";
    }
  },
  // Add more targets as needed
];
```

## Troubleshooting

- If your images aren't being recognized, try improving the image contrast
- Ensure good lighting conditions during scanning
- Make sure the target index matches the order of images you uploaded to the compiler
- The more distinct features your image has, the better it will be recognized 
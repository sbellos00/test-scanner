import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import { setTimeout } from 'timers/promises';

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// Function to convert video to audio with an "_audio" suffix
async function convertVideoToAudio(videoUrl: string) {
  // Validate URL format
  if (!videoUrl.includes('cloudinary.com') || !videoUrl.includes('/upload/')) {
    throw new Error('Invalid Cloudinary URL format. Must be a valid Cloudinary URL containing "/upload/"');
  }
  
  try {
    // Parse the URL to get the relevant parts
    // Example URL: https://res.cloudinary.com/dawyrpt2m/video/upload/v1743300047/TheLostTapesIntro_yo6brk.mp4
    const urlParts = videoUrl.split('/upload/');
    const baseUrl = urlParts[0] + '/upload/'; // https://res.cloudinary.com/dawyrpt2m/video/upload/
    
    const afterUpload = urlParts[1]; // v1743300047/TheLostTapesIntro_yo6brk.mp4
    const versionSlashIndex = afterUpload.indexOf('/');
    const version = afterUpload.substring(0, versionSlashIndex); // v1743300047
    
    const filenameWithExt = afterUpload.substring(versionSlashIndex + 1); // TheLostTapesIntro_yo6brk.mp4
    const publicId = filenameWithExt.split('.')[0]; // TheLostTapesIntro_yo6brk
    
    // Define the new audio public ID with suffix
    const audioPublicId = `${publicId}_audio`; // TheLostTapesIntro_yo6brk_audio
    
    console.log('URL components:');
    console.log('Base URL:', baseUrl);
    console.log('Version:', version);
    console.log('Public ID:', publicId);
    
    // Create a direct transformation URL for MP3
    const mp3Url = cloudinary.url(`${version}/${publicId}`, {
      resource_type: 'video',
      format: 'mp3',
    });
    
    console.log('MP3 transformation URL:', mp3Url);
    
    // We need to upload this transformed file with our desired public ID
    console.log('Accessing transformed MP3...');
    
    try {
      // Upload the transformed MP3 with our desired public ID
      const result = await cloudinary.uploader.upload(mp3Url, {
        resource_type: 'video', // Use video resource type for both audio and video
        public_id: audioPublicId,
        format: 'mp3',
        overwrite: true,
        type: 'upload'
      });
      
      console.log('MP3 uploaded successfully with custom ID!');
      console.log('Audio URL:', result.secure_url);
      
      // Construct expected URL with version
      const expectedUrl = `${baseUrl}${version}/${audioPublicId}.mp3`;
      console.log('Expected URL format:', expectedUrl);
      
      return result.secure_url;
    } catch (uploadError) {
      console.error('Error during upload:', uploadError);
      
      // Alternative approach: create a signed URL and upload
      console.log('Trying alternative approach...');
      
      // Create delivery URL with authentication
      const signedUrl = cloudinary.utils.url(`${version}/${publicId}.mp3`, {
        resource_type: 'video',
        sign_url: true,
        type: 'upload'
      });
      
      console.log('Signed URL:', signedUrl);
      
      const result = await cloudinary.uploader.upload(signedUrl, {
        resource_type: 'video',
        public_id: audioPublicId,
        format: 'mp3',
        overwrite: true
      });
      
      console.log('Alternative upload succeeded!');
      console.log('Audio URL:', result.secure_url);
      
      return result.secure_url;
    }
  } catch (error) {
    console.error('Error converting video to audio:', error);
    return null;
  }
}

// Main execution
async function main() {
  const videoUrl = process.argv[2];
  
  if (!videoUrl) {
    console.log('Usage: npx ts-node scripts/convertMp3.ts "https://res.cloudinary.com/your-cloud/video/upload/v12345/your-video-id.mp4"');
    console.log('Please provide a Cloudinary video URL as a command line argument');
    process.exit(1);
  }
  
  console.log('Converting video to audio:', videoUrl);
  try {
    const audioUrl = await convertVideoToAudio(videoUrl);
    if (audioUrl) {
      console.log('\nConversion completed successfully!');
      console.log('Final audio URL:', audioUrl);
    } else {
      console.error('Conversion failed');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
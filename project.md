# HyperSpace Scanner Project Specifications

## Project Overview
HyperSpace Scanner is an AR-based image-recognition system acting as an innovative alternative to QR codes ("QR 2.0"). The system detects specific images (image targets) via the user's mobile camera and immediately redirects them to dynamically set URLs. Each target image can be updated regularly (e.g., every 30 minutes) with a new destination URL.

## Technology Stack

### Front-end (Scanner App):
- **Framework:** Next.js (hosted on Vercel)
- **AR Library:** MindAR.js
- **Functionality:**
  - Scans image targets using MindAR.
  - On detection (`targetFound` event), the app calls a lightweight serverless API to fetch the active URL and immediately redirects the user.
- **Device Limitation:** Scanner functionality limited to mobile devices for optimal user experience.

### Back-end & API:
- **Hosted on:** Vercel Serverless Functions
- **Primary Responsibility:** Provide the current active link for scanners.
- **Caching Strategy:** Scheduled Cache Refresh every 30 minutes:
  - A scheduled (cron) job queries the central database every 30 minutes.
  - Updates a fast-access cache (Vercel KV or CDN-hosted static file).
  - API endpoint returns this cached link to scanners without database lookups on each request.

### Admin Dashboard:
- **Purpose:** Allow dynamic updating and management of image target links (schedule).
- **Capabilities:**
  - Create, edit, delete scheduled URL entries.
  - View the currently active link and schedule history.
- **Backend Storage:** Simple database (e.g., Vercel KV, Supabase, or similar)

## Workflow Example:

1. **Admin:** Uses admin interface to schedule the URL that scanners redirect to between 2:00-2:30 PM UTC.
2. **Scheduled Task:** Every 30 minutes, queries the database and caches the current URL.
3. **Client Scanner:**
   - User opens scanner.
  - MindAR.js recognizes the target image and triggers a `targetFound` event.
  - Scanner calls the serverless API endpoint (which reads cached data).
  - User is redirected to the URL returned by the API.

## Security Considerations:
- Front-end scanning logic is inherently open (inspectable by users). Therefore, no sensitive data or future schedules should ever be exposed client-side.
- Serverless API returns only the current active URL, ensuring future scheduled links are never exposed to clients.

## Performance and Scalability:
- Due to caching and scheduled updates, the scanner app should remain performant even at high scale (millions of scans daily).
- API calls are lightweight and cost-effective due to minimal computation and caching.

This structure provides a secure, scalable, and efficient system designed specifically to support HyperSpace’s dynamic scanning and redirection functionality.


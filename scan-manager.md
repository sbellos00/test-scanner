We will manage the scan connections through the sql GUI
We run the GUI, make changes, we then run npm run export-mappings. Test the mappings and then use npm run build, ensure all it's good, and then move on.
We commit and push to github which will redeploy the scanner with the updated connections.


What we also need to complete management:

- Descriptions for scan-targets
- Tags for scan-targets
- Scanners where these targets are active
- .mind files these targets are included in along with their id 
- Link to the images each scan-target refers to
- A way to build scanner pages
- Remove the hardcoding from the scanner pages, make it easier to manage

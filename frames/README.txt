FRAME-BY-FRAME SCROLL FILM — HOW TO USE

1. Export your video as image sequence (60-120 frames recommended):
   - In Premiere / After Effects / DaVinci: Export as JPG sequence
   - Or use ffmpeg: ffmpeg -i your_video.mp4 -vf fps=30 public/frames/frame_%04d.jpg

2. Name frames EXACTLY like this:
   frame_0001.jpg
   frame_0002.jpg
   frame_0003.jpg
   ...
   frame_0072.jpg   (for 72 frames)

   Also supports .png: frame_0001.png

3. Drop all frames into this folder: E:\opencode-web\petal-bloom\public\frames\

4. Refresh http://localhost:5175/ — the site auto-detects frames and switches from video fallback to your canvas scroll film.

Tips:
- 72 frames = smooth, 120 = ultra smooth
- Keep each JPG ~150-300KB (resize to 1920x1080 max) for fast loading
- No need to push to GitHub — just tell me when done and I'll tune speed/pin length

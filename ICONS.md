# PWA Icons Setup

The PWA requires proper icon files for installation on mobile devices.

## Required Icons

- `public/icon-192.png` - 192x192 pixels
- `public/icon-512.png` - 512x512 pixels

## How to Create Icons

1. **Using Online Tools:**
   - Visit [Favicon.io](https://favicon.io/) or [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Upload a logo or create one with text
   - Download the generated icons
   - Replace the placeholder files in the `public/` directory

2. **Using Design Software:**
   - Create a square icon (512x512 minimum)
   - Use the medical/health theme (🏥 or similar)
   - Export as PNG in both 192x192 and 512x512 sizes

3. **Suggested Icon Design:**
   - Medical cross or stethoscope icon
   - Primary color: #0ea5e9 (blue, matching the app theme)
   - Simple, recognizable design
   - White or light background for better visibility

## After Creating Icons

1. Replace the placeholder files in `public/icon-192.png` and `public/icon-512.png`
2. Rebuild the application: `npm run build`
3. The PWA will automatically use the new icons

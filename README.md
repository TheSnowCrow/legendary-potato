# 🏥 Pediatric Symptom Tracker

A privacy-first Progressive Web App (PWA) for tracking pediatric symptoms and generating professional medical summaries without collecting any personal identifying information (PHI).

**[Live Demo](https://yourusername.github.io/legendary-potato/)** (Replace with your actual GitHub Pages URL)

## ✨ Features

### 🔒 Privacy First
- **No PHI Collection**: Uses anonymous identifiers only (e.g., "Child 1", emojis)
- **Local Storage Only**: All data stored in browser IndexedDB, never sent to any server
- **HIPAA Compliant Design**: Built with privacy regulations in mind
- **Export & Delete**: Full control over your data

### 📊 Comprehensive Tracking

#### Patient Management
- Multiple children support with anonymous identifiers
- Custom emoji selection for easy identification
- No names, birthdates, or personal information required

#### Symptom Tracking
- Quick-entry buttons for common symptoms
- Severity levels (mild, moderate, severe)
- Symptom resolution tracking
- Custom symptom support
- Timestamp for every entry

#### Vital Signs Logging
- **Temperature**: Multiple units (F/C) and methods (oral, rectal, temporal, axillary)
- **Breathing**: Rate and difficulty assessment
- **Hydration**: Wet diaper count and fluid intake
- **Food Intake**: Normal, reduced, or refusing
- **Sleep**: Duration and quality tracking

#### Interventions & Medications
- Medication logging with dose tracking
- Treatment tracking (nebulizer, nasal suctioning, etc.)
- Effectiveness tracking (helped, no change, made worse)
- Medication timing helper to prevent double-dosing

### 📈 Visual Data Presentation
- **Timeline View**: Chronological display of all events
- **Temperature Chart**: Line graph showing fever trends
- **Symptom Duration Bars**: Visual representation of symptom progression
- **Daily Summary Cards**: Organized by day

### 📄 Medical Summary Generation
- Auto-generated HPI (History of Present Illness) in professional format
- Includes: onset, symptom progression, vital signs, interventions, effectiveness
- Real-time updates as data is added
- Easily copyable for doctor visits

### 💾 Export Capabilities
- **PDF Export**: Professional medical summary
- **Text Export**: Plain text format
- Copy summary to clipboard
- Archive completed illness episodes

### 📱 PWA Features
- Fully functional offline
- Installable to home screen
- Responsive design (mobile-first, works on desktop)
- Fast load times
- Service worker for offline capability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/legendary-potato.git
   cd legendary-potato
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📦 Deployment to GitHub Pages

### Automated Deployment

1. **Create GitHub repository**
   ```bash
   git remote add origin https://github.com/yourusername/legendary-potato.git
   ```

2. **Update `vite.config.ts`**
   - Change the `base` property to match your repository name:
   ```typescript
   base: '/legendary-potato/', // or '/your-repo-name/'
   ```

3. **Build and deploy**
   ```bash
   npm run build
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

4. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to Pages section
   - Select `gh-pages` branch as source
   - Your app will be available at `https://yourusername.github.io/legendary-potato/`

### Alternative: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB (via Dexie.js)
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa

## 📱 PWA Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home screen"
4. Tap "Install"

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install"

## 🎨 Customization

### Icons
See [ICONS.md](./ICONS.md) for instructions on creating custom PWA icons.

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
}
```

### Symptom/Medication Lists
Edit `src/db/database.ts` to customize:
- `COMMON_SYMPTOMS`
- `COMMON_MEDICATIONS`
- `COMMON_TREATMENTS`

## 🔐 Privacy & Security

### What Data is Collected?
**None.** All data is stored locally in your browser.

### What Data is Sent to Servers?
**None.** This app runs entirely in your browser with no backend.

### Data Portability
- Export your data as PDF or text files
- Data is stored in IndexedDB in your browser
- Clear all data at any time from the browser settings

### HIPAA Considerations
While this app is designed with privacy in mind:
- It does not collect PHI (no names, birthdates, addresses, etc.)
- All data is local only
- However, this is a tool for personal use and is not a HIPAA-covered entity
- Always follow your organization's policies if using in a clinical setting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Medical Disclaimer

**This app is for tracking purposes only and does not provide medical advice.**

- Always seek the advice of your physician or qualified health provider
- Never disregard professional medical advice
- If you think you have a medical emergency, call your doctor or emergency services immediately
- This app is not a substitute for professional medical care

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with privacy-first principles
- Inspired by the need for better symptom tracking tools for parents
- No PHI, no tracking, no ads, no data collection

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/legendary-potato/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/legendary-potato/discussions)

---

Made with ❤️ for parents tracking their children's health

**Remember**: This is a tool for record-keeping. Always consult healthcare professionals for medical decisions.

# ✂️ BG Remover HD | Cutout Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Wasm](https://img.shields.io/badge/WebAssembly-ONNX-green.svg)](https://webassembly.org/)

An open-source, privacy-first, ultra-high-resolution AI Background Removal web application. Built with **React**, **Vite**, and **WebAssembly/WebGL AI models**, it segments subjects locally in the browser and composite results onto the full native image resolution without quality loss or pixelation.

Designed with a sleek, razor-sharp **Vercel dark minimal aesthetic** featuring **Space Grotesk** typography and **Orangered (`#ff4500`)** accents.

---

## ✨ Features

- ⚡ **100% Full Native Resolution**: Standard online background removers downscale photos to ~512px, producing blurry results. **BG Remover HD** resamples the AI matte back to 100% of the original photo resolution (4K, 8K, 12MP+), guaranteeing zero quality loss.
- 🔒 **100% Local Privacy**: Runs entirely in your browser using `@imgly/background-removal` powered by ONNX Runtime Web. No photos are ever uploaded to any server.
- 🖌️ **Precision Manual Refining Tools**:
  - **Restore Brush**: Paint back masked foreground areas.
  - **Erase Brush**: Clean up residual background artifacts.
  - **Brush Controls**: Adjust brush size (2px–250px) and hardness/feathering.
  - **Stylus & Touch Support**: Responds to touch gestures and pressure-sensitive pens.
- 🔍 **HD Viewport Engine**: Smooth zoom (10% to 1000%) with 2-finger/mouse panning for pixel-level edge touch-ups.
- 👁️ **Before / After Comparison**: Live interactive split-screen slider and toggleable red translucent mask overlay.
- 🎨 **Studio Background Replacement**:
  - **Transparent PNG** (Checkerboard pattern)
  - **Solid Colors** (Presets & HEX picker)
  - **Studio Gradients** (Sunset Glow, Neon Cyber, Dark Studio, Soft Purple)
  - **Bokeh Background Blur** (Custom blur intensity slider)
  - **Custom Image Upload** (Set any custom background photo)
- 📋 **1-Click Copy & Export**: Copy transparent PNG directly to clipboard or export full-res PNG/JPEG.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6
- **AI Inference**: `@imgly/background-removal` (ONNX Runtime Web / WebAssembly / WebGL)
- **Icons**: Lucide React
- **Typography**: Space Grotesk (UI Controls & Headings), DM Mono (Technical Data), Plus Jakarta Sans
- **Styling**: Pure CSS Design System with Vercel minimal aesthetic

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/bgremover-hd.git
   cd bgremover-hd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
bgremover-hd/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── BackgroundSelector.jsx   # Custom background replacement panel
│   │   ├── CanvasEditor.jsx         # HD Canvas rendering, zoom/pan & drawing engine
│   │   ├── ExportModal.jsx          # Download and clipboard copy modal
│   │   ├── Header.jsx               # Top bar navigation & actions
│   │   ├── SampleImages.jsx         # 1-click test photos
│   │   └── Toolbar.jsx              # Manual refine tools & brush sliders
│   ├── utils/
│   │   ├── aiBackground.js          # Local AI inference & HD composite renderer
│   │   └── historyManager.js        # Undo/Redo canvas history stack
│   ├── App.jsx                      # Main workspace & layout container
│   ├── index.css                    # Vercel design system tokens & styles
│   └── main.jsx                     # Application entry point
├── index.html                   # HTML template & font imports
├── package.json                 # Project dependencies & scripts
├── vercel.json                  # Vercel SPA routing configuration
└── vite.config.js               # Vite build configuration
```

---

## ☁️ Deployment

### Deploying to Vercel

This repository includes a [`vercel.json`](vercel.json) file configured for Single Page Application (SPA) routing.

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Leave the build command as `npm run build` and output directory as `dist`.
4. Deploy!

---

## 🤝 Attribution & Transparency

> **Transparency Note**: This open-source tool was initially generated with AI assistance, then manually reviewed, refined, optimized, and maintained by [Cristiano Bleve](https://cristianobleve.com).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

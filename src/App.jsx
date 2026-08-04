import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { BackgroundSelector } from './components/BackgroundSelector';
import { CanvasEditor } from './components/CanvasEditor';
import { ExportModal } from './components/ExportModal';
import { SampleImages } from './components/SampleImages';
import { processBackgroundRemoval, renderFinalOutput, loadImage } from './utils/aiBackground';
import { HistoryManager } from './utils/historyManager';
import { Upload, Wand2, Check, ExternalLink, Cpu, Paintbrush, Palette, Sliders, X } from 'lucide-react';

const history = new HistoryManager(30);

export default function App() {
  // Image & Mask State
  const [originalImg, setOriginalImg] = useState(null);
  const [maskCanvas, setMaskCanvas] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Background Customization State
  const [bgOption, setBgOption] = useState({ type: 'transparent' });
  const [bgImageObj, setBgImageObj] = useState(null);

  // Editor Tools & Viewport State
  const [activeTool, setActiveTool] = useState('restore');
  const [brushSize, setBrushSize] = useState(35);
  const [brushHardness, setBrushHardness] = useState(85);
  const [viewMode, setViewMode] = useState('result');
  const [showMaskOverlay, setShowMaskOverlay] = useState(false);

  // Mobile Drawer State ('none', 'tools', 'background')
  const [mobileDrawer, setMobileDrawer] = useState('none');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // History Undo / Redo Trigger Counter
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Processing & Toast State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState({ status: '', progress: 0, message: '' });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateHistoryState = () => {
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
  };

  // Main Image Load & AI Trigger
  const handleFileSelect = async (fileOrUrl) => {
    try {
      setIsProcessing(true);
      history.clear();

      const result = await processBackgroundRemoval(fileOrUrl, (info) => {
        setProgressInfo(info);
      });

      setOriginalImg(result.originalImg);
      setMaskCanvas(result.initialMaskCanvas);
      setDimensions({ width: result.width, height: result.height });

      history.pushState(result.initialMaskCanvas);
      updateHistoryState();

      showToast('Sfondo rimosso con successo in Ultra HD!');
    } catch (err) {
      console.error('Processing error:', err);
      showToast('Errore durante l\'elaborazione dell\'immagine');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaskModified = () => {
    if (maskCanvas) {
      history.pushState(maskCanvas);
      updateHistoryState();
    }
  };

  const handleUndo = () => {
    if (maskCanvas) {
      history.undo(maskCanvas);
      updateHistoryState();
      setMaskCanvas(maskCanvas);
    }
  };

  const handleRedo = () => {
    if (maskCanvas) {
      history.redo(maskCanvas);
      updateHistoryState();
      setMaskCanvas(maskCanvas);
    }
  };

  const handleInvertMask = () => {
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      d[i + 3] = 255 - d[i + 3];
    }

    ctx.putImageData(imgData, 0, 0);
    handleMaskModified();
    showToast('Maschera invertita');
  };

  const handleAutoRefine = () => {
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    ctx.filter = 'blur(1.5px)';
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.filter = 'none';

    handleMaskModified();
    showToast('Bordi ammorbiditi con successo');
  };

  const handleUploadBgImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await loadImage(file);
    setBgImageObj(img);
    setBgOption({ type: 'image' });
    showToast('Immagine di sfondo caricata');
  };

  const handleQuickCopy = async () => {
    if (!originalImg || !maskCanvas) return false;
    try {
      const outputCanvas = renderFinalOutput({
        originalImg,
        maskCanvas,
        bgOption,
        bgImageObj
      });

      const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopied(true);
      showToast('Immagine copiata negli appunti!');
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('Copia negli appunti non supportata');
      return false;
    }
  };

  const handleDownload = ({ format, quality }) => {
    if (!originalImg || !maskCanvas) return;
    const outputCanvas = renderFinalOutput({
      originalImg,
      maskCanvas,
      bgOption,
      bgImageObj
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = `bg-removed-hd-${Date.now()}.${format}`;
    link.href = outputCanvas.toDataURL(mime, quality);
    link.click();
    showToast('Download avviato!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Top Bar Header */}
      <Header
        hasImage={!!originalImg}
        onNewImage={() => fileInputRef.current?.click()}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenExport={() => setIsExportOpen(true)}
        onQuickCopy={handleQuickCopy}
        copied={copied}
        isProcessing={isProcessing}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {/* Main Workspace Body */}
      {originalImg ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Desktop Left Toolbar */}
          {!isMobile && (
            <Toolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              brushHardness={brushHardness}
              setBrushHardness={setBrushHardness}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showMaskOverlay={showMaskOverlay}
              setShowMaskOverlay={setShowMaskOverlay}
              onInvertMask={handleInvertMask}
              onAutoRefine={handleAutoRefine}
              isProcessing={isProcessing}
            />
          )}

          {/* Canvas Center Viewport */}
          <CanvasEditor
            originalImg={originalImg}
            maskCanvas={maskCanvas}
            bgOption={bgOption}
            bgImageObj={bgImageObj}
            activeTool={activeTool}
            brushSize={brushSize}
            brushHardness={brushHardness}
            viewMode={viewMode}
            showMaskOverlay={showMaskOverlay}
            onMaskModified={handleMaskModified}
          />

          {/* Desktop Right Background Panel */}
          {!isMobile && (
            <BackgroundSelector
              bgOption={bgOption}
              setBgOption={setBgOption}
              onUploadBgImage={handleUploadBgImage}
            />
          )}

          {/* Mobile Sliding Bottom Sheet Drawer */}
          {isMobile && mobileDrawer !== 'none' && (
            <div className="mobile-drawer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary-accent)' }}>
                  {mobileDrawer === 'tools' ? 'Strumenti Pennello & Maschera' : 'Sfondo Personalizzato'}
                </span>
                <button
                  onClick={() => setMobileDrawer('none')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {mobileDrawer === 'tools' ? (
                <Toolbar
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  brushHardness={brushHardness}
                  setBrushHardness={setBrushHardness}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  showMaskOverlay={showMaskOverlay}
                  setShowMaskOverlay={setShowMaskOverlay}
                  onInvertMask={handleInvertMask}
                  onAutoRefine={handleAutoRefine}
                  isProcessing={isProcessing}
                />
              ) : (
                <BackgroundSelector
                  bgOption={bgOption}
                  setBgOption={setBgOption}
                  onUploadBgImage={handleUploadBgImage}
                />
              )}
            </div>
          )}

          {/* Mobile Bottom Navigation Bar */}
          {isMobile && (
            <div className="mobile-bottom-bar">
              <button
                className={`mobile-nav-btn ${mobileDrawer === 'tools' ? 'active' : ''}`}
                onClick={() => setMobileDrawer(mobileDrawer === 'tools' ? 'none' : 'tools')}
              >
                <Paintbrush size={18} />
                <span>Pennello</span>
              </button>

              <button
                className={`mobile-nav-btn ${mobileDrawer === 'background' ? 'active' : ''}`}
                onClick={() => setMobileDrawer(mobileDrawer === 'background' ? 'none' : 'background')}
              >
                <Palette size={18} />
                <span>Sfondo</span>
              </button>

              <button
                className={`mobile-nav-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode(viewMode === 'split' ? 'result' : 'split')}
              >
                <Sliders size={18} />
                <span>{viewMode === 'split' ? 'Singola' : 'Prima/Dopo'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State Vercel Minimal Dropzone */
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div
            className="panel-vercel"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '36px 24px',
              maxWidth: '580px',
              width: '100%',
              cursor: 'pointer',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              transition: 'border-color 0.15s ease, background 0.15s ease',
              background: '#0a0a0a'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: '#111111',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={24} color="var(--primary-accent)" />
            </div>

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                Carica o Trascina un'Immagine
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                Rimuovi lo sfondo in locale ad altissima risoluzione <strong style={{ color: 'var(--primary-accent)' }}>SENZA sgranare</strong>.
              </p>
            </div>

            <button className="btn-vercel primary" style={{ marginTop: '4px', padding: '10px 22px', fontSize: '14px' }}>
              <Wand2 size={16} />
              <span>Seleziona Immagine</span>
            </button>
          </div>

          <SampleImages onSelectSample={(url) => handleFileSelect(url)} />

          <footer style={{
            marginTop: '24px',
            fontSize: '11px',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0a0a0a',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Cpu size={13} color="var(--primary-accent)" />
            <span>Uno strumento realizzato con l'AI, revisionato e completato da</span>
            <a
              href="https://cristianobleve.com"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link"
              style={{ fontWeight: '600', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Cristiano Bleve</span>
              <ExternalLink size={10} />
            </a>
          </footer>
        </main>
      )}

      {/* AI Processing Loader */}
      {isProcessing && (
        <div className="modal-overlay">
          <div className="panel-vercel" style={{
            padding: '24px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '340px',
            background: '#0a0a0a'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid #222222',
              borderTopColor: 'var(--primary-accent)',
              animation: 'spin 0.7s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                {progressInfo.message || 'Elaborazione IA in corso...'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Motore AI WebAssembly / WebGL
              </div>
            </div>

            <div style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: '#222222',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.round(progressInfo.progress * 100)}%`,
                background: 'var(--primary-accent)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        width={dimensions.width}
        height={dimensions.height}
        onDownload={handleDownload}
        onCopyClipboard={handleQuickCopy}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Check size={16} color="var(--primary-accent)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

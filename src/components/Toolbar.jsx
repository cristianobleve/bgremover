import React from 'react';
import { 
  Paintbrush, 
  Eraser, 
  ZoomIn, 
  Sliders, 
  FlipHorizontal, 
  Eye, 
  Split,
  Sparkles,
  Layers
} from 'lucide-react';

export function Toolbar({
  activeTool,
  setActiveTool,
  brushSize,
  setBrushSize,
  brushHardness,
  setBrushHardness,
  viewMode,
  setViewMode,
  showMaskOverlay,
  setShowMaskOverlay,
  onInvertMask,
  onAutoRefine,
  isProcessing
}) {
  return (
    <aside className="panel-vercel" style={{
      width: '280px',
      padding: '14px',
      margin: '0 0 12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 90px)'
    }}>
      {/* Tool Selection Section */}
      <div>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-subtle)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sliders size={13} color="var(--primary-accent)" />
          <span>Strumenti Selezione</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            className={`btn-vercel ${activeTool === 'restore' ? 'active' : ''}`}
            onClick={() => setActiveTool('restore')}
            style={{ justifyContent: 'center' }}
          >
            <Paintbrush size={14} />
            <span>Ripristina</span>
          </button>

          <button
            className={`btn-vercel ${activeTool === 'erase' ? 'active' : ''}`}
            onClick={() => setActiveTool('erase')}
            style={{ justifyContent: 'center' }}
          >
            <Eraser size={14} />
            <span>Cancella</span>
          </button>

          <button
            className={`btn-vercel ${activeTool === 'pan' ? 'active' : ''}`}
            onClick={() => setActiveTool('pan')}
            style={{ justifyContent: 'center', gridColumn: 'span 2' }}
          >
            <ZoomIn size={14} />
            <span>Zoom & Pan HD</span>
          </button>
        </div>
      </div>

      {/* Brush Sliders */}
      {(activeTool === 'restore' || activeTool === 'erase') && (
        <div className="panel-vercel" style={{ padding: '12px', background: '#050505' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dimensione Pennello</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)' }}>
                {brushSize}px
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="250"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Durezza / Sfumatura</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)' }}>
                {brushHardness}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={brushHardness}
              onChange={(e) => setBrushHardness(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Quick Mask Actions */}
      <div>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-subtle)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Layers size={13} color="var(--primary-accent)" />
          <span>Azioni Maschera</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            className="btn-vercel"
            onClick={onInvertMask}
            disabled={isProcessing}
          >
            <FlipHorizontal size={14} />
            <span>Inverti Selezione</span>
          </button>

          <button
            className="btn-vercel"
            onClick={onAutoRefine}
            disabled={isProcessing}
          >
            <Sparkles size={14} color="var(--primary-accent)" />
            <span>Migliora Bordi</span>
          </button>
        </div>
      </div>

      {/* View Options */}
      <div>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-subtle)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Eye size={13} color="var(--primary-accent)" />
          <span>Modalità Vista</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            className={`btn-vercel ${viewMode === 'result' ? 'active' : ''}`}
            onClick={() => setViewMode('result')}
            style={{ justifyContent: 'center' }}
          >
            <Eye size={14} />
            <span>Singola</span>
          </button>

          <button
            className={`btn-vercel ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            style={{ justifyContent: 'center' }}
          >
            <Split size={14} />
            <span>Prima / Dopo</span>
          </button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '4px'
          }}>
            <input
              type="checkbox"
              checked={showMaskOverlay}
              onChange={(e) => setShowMaskOverlay(e.target.checked)}
              style={{ accentColor: 'var(--primary-accent)', width: '14px', height: '14px' }}
            />
            <span>Mostra Maschera Rossa</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

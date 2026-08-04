import React from 'react';
import { 
  Wand2, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Copy, 
  ImagePlus, 
  Check,
  ExternalLink
} from 'lucide-react';

export function Header({
  hasImage,
  onNewImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExport,
  onQuickCopy,
  copied,
  isProcessing
}) {
  return (
    <header className="panel-vercel" style={{
      padding: '10px 16px',
      margin: '12px 16px 8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
      borderRadius: 'var(--radius-md)'
    }}>
      {/* Brand & Portfolio Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          background: '#111111',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Wand2 size={16} color="var(--primary-accent)" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '-0.2px', color: '#fff', whiteSpace: 'nowrap' }}>
              BG Remover <span style={{ color: 'var(--primary-accent)' }}>HD</span>
            </h1>
            <span className="badge-vercel hide-mobile">
              100% NATIVE RES
            </span>
          </div>
          
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
            <span>by</span>
            <a
              href="https://cristianobleve.com"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link"
              style={{ fontWeight: '600', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              <span>Cristiano Bleve</span>
              <ExternalLink size={8} />
            </a>
          </div>
        </div>
      </div>

      {/* Center Actions / History */}
      {hasImage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="btn-vercel"
            onClick={onUndo}
            disabled={!canUndo || isProcessing}
            title="Annulla (Ctrl+Z)"
            style={{ padding: '6px 10px' }}
          >
            <RotateCcw size={14} />
            <span className="hide-mobile">Annulla</span>
          </button>

          <button
            className="btn-vercel"
            onClick={onRedo}
            disabled={!canRedo || isProcessing}
            title="Ripristina (Ctrl+Y)"
            style={{ padding: '6px 10px' }}
          >
            <RotateCw size={14} />
            <span className="hide-mobile">Ripristina</span>
          </button>

          <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

          <button
            className="btn-vercel"
            onClick={onNewImage}
            disabled={isProcessing}
            title="Carica una nuova foto"
            style={{ padding: '6px 10px' }}
          >
            <ImagePlus size={14} />
            <span className="hide-mobile">Nuova Foto</span>
          </button>
        </div>
      )}

      {/* Right Export Actions */}
      {hasImage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn-vercel hide-mobile"
            onClick={onQuickCopy}
            disabled={isProcessing}
            style={{
              borderColor: copied ? 'var(--primary-accent)' : 'var(--border-subtle)',
              color: copied ? 'var(--primary-accent)' : 'var(--text-main)'
            }}
          >
            {copied ? <Check size={14} color="var(--primary-accent)" /> : <Copy size={14} />}
            <span>{copied ? 'Copiato!' : 'Copia PNG'}</span>
          </button>

          <button
            className="btn-vercel primary"
            onClick={onOpenExport}
            disabled={isProcessing}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Download size={14} />
            <span>Esporta</span>
          </button>
        </div>
      )}
    </header>
  );
}

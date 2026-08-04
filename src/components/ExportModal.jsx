import React, { useState } from 'react';
import { Download, Copy, X, Check, FileImage, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ExportModal({
  isOpen,
  onClose,
  width,
  height,
  onDownload,
  onCopyClipboard
}) {
  const [format, setFormat] = useState('png');
  const [jpegQuality, setJpegQuality] = useState(0.95);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    onDownload({ format, quality: jpegQuality });
    onClose();
  };

  const handleCopyClick = async () => {
    const success = await onCopyClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="panel-vercel"
        style={{
          width: '90%',
          maxWidth: '480px',
          padding: '20px',
          position: 'relative',
          background: '#0a0a0a',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: '#111111',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Download size={16} color="var(--primary-accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Esporta Immagine Ultra HD</h2>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mantiene il 100% della risoluzione originale</div>
          </div>
        </div>

        {/* Specs Box */}
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: '#050505',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '700' }}>
              Risoluzione Native
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '600', color: 'var(--primary-accent)', marginTop: '2px' }}>
              {width} × {height} px
            </div>
          </div>
          <div className="badge-vercel">
            <ShieldCheck size={11} /> 100% Native
          </div>
        </div>

        {/* Format Options */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>Formato di Salvataggio</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              className={`btn-vercel ${format === 'png' ? 'active' : ''}`}
              onClick={() => setFormat('png')}
              style={{ padding: '10px', justifyContent: 'center' }}
            >
              <FileImage size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>PNG</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>Trasparente</div>
              </div>
            </button>

            <button
              className={`btn-vercel ${format === 'jpeg' ? 'active' : ''}`}
              onClick={() => setFormat('jpeg')}
              style={{ padding: '10px', justifyContent: 'center' }}
            >
              <FileImage size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>JPEG</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>Alta Qualità</div>
              </div>
            </button>
          </div>
        </div>

        {/* JPEG Quality Slider */}
        {format === 'jpeg' && (
          <div style={{ marginBottom: '16px', padding: '10px', background: '#050505', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Qualità JPEG</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)' }}>
                {Math.round(jpegQuality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={jpegQuality}
              onChange={(e) => setJpegQuality(Number(e.target.value))}
            />
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            className="btn-vercel"
            onClick={handleCopyClick}
            style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
          >
            {copied ? <Check size={16} color="var(--primary-accent)" /> : <Copy size={16} />}
            <span>{copied ? 'Copiato!' : 'Copia negli Appunti'}</span>
          </button>

          <button
            className="btn-vercel primary"
            onClick={handleDownloadClick}
            style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
          >
            <Download size={16} />
            <span>Scarica HD</span>
          </button>
        </div>
      </div>
    </div>
  );
}

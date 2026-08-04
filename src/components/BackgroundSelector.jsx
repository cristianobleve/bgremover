import React from 'react';
import { 
  Grid, 
  Palette, 
  Sparkles, 
  Droplet, 
  Image as ImageIcon,
  Check
} from 'lucide-react';

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f3f4f6', '#1f2937', 
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'
];

const PRESET_GRADIENTS = [
  { id: 'sunset', name: 'Sunset Glow', css: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
  { id: 'neon', name: 'Neon Cyber', css: 'linear-gradient(135deg, #00f2fe, #4facfe)' },
  { id: 'studio', name: 'Dark Studio', css: 'linear-gradient(135deg, #232526, #414345)' },
  { id: 'soft', name: 'Soft Purple', css: 'linear-gradient(135deg, #a8c0ff, #3f2b96)' }
];

export function BackgroundSelector({ bgOption, setBgOption, onUploadBgImage }) {
  return (
    <div className="panel-vercel" style={{
      width: '280px',
      padding: '14px',
      margin: '0 16px 12px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 90px)'
    }}>
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
          <Palette size={13} color="var(--primary-accent)" />
          <span>Sfondo Personalizzato</span>
        </div>

        {/* Modes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            className={`btn-vercel ${bgOption.type === 'transparent' ? 'active' : ''}`}
            onClick={() => setBgOption({ type: 'transparent' })}
            style={{ justifyContent: 'center' }}
          >
            <Grid size={14} />
            <span>Trasparente</span>
          </button>

          <button
            className={`btn-vercel ${bgOption.type === 'color' ? 'active' : ''}`}
            onClick={() => setBgOption({ type: 'color', value: bgOption.value || '#ffffff' })}
            style={{ justifyContent: 'center' }}
          >
            <Palette size={14} />
            <span>Colore</span>
          </button>

          <button
            className={`btn-vercel ${bgOption.type === 'gradient' ? 'active' : ''}`}
            onClick={() => setBgOption({ type: 'gradient', value: 'neon' })}
            style={{ justifyContent: 'center' }}
          >
            <Sparkles size={14} />
            <span>Gradiente</span>
          </button>

          <button
            className={`btn-vercel ${bgOption.type === 'blur' ? 'active' : ''}`}
            onClick={() => setBgOption({ type: 'blur', blurAmount: bgOption.blurAmount || 25 })}
            style={{ justifyContent: 'center' }}
          >
            <Droplet size={14} />
            <span>Sfocato</span>
          </button>
        </div>
      </div>

      {/* Colors Palette Options */}
      {bgOption.type === 'color' && (
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Colori Tinta Unita</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                onClick={() => setBgOption({ type: 'color', value: hex })}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: hex,
                  border: bgOption.value === hex ? '2px solid var(--primary-accent)' : '1px solid #333333',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Custom:</span>
            <input
              type="color"
              value={bgOption.value || '#ffffff'}
              onChange={(e) => setBgOption({ type: 'color', value: e.target.value })}
              style={{
                width: '32px',
                height: '32px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                background: 'transparent',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      )}

      {/* Gradients Options */}
      {bgOption.type === 'gradient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stili Gradiente Studio</div>
          {PRESET_GRADIENTS.map((grad) => (
            <button
              key={grad.id}
              onClick={() => setBgOption({ type: 'gradient', value: grad.id })}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: grad.css,
                border: bgOption.value === grad.id ? '2px solid var(--primary-accent)' : 'none',
                color: '#fff',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{grad.name}</span>
              {bgOption.value === grad.id && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>
      )}

      {/* Blur Background Options */}
      {bgOption.type === 'blur' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sfocatura Bokeh</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)' }}>
              {bgOption.blurAmount || 25}px
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            value={bgOption.blurAmount || 25}
            onChange={(e) => setBgOption({ ...bgOption, blurAmount: Number(e.target.value) })}
          />
        </div>
      )}

      {/* Upload Custom Photo Background */}
      <div style={{ marginTop: 'auto' }}>
        <label className="btn-vercel" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
          <ImageIcon size={14} color="var(--primary-accent)" />
          <span>Carica Foto di Sfondo</span>
          <input
            type="file"
            accept="image/*"
            onChange={onUploadBgImage}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}

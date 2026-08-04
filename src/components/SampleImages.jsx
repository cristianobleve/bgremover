import React from 'react';
import { Sparkles } from 'lucide-react';

const SAMPLES = [
  {
    id: 'portrait',
    title: 'Ritratto HD',
    desc: 'Bordi e dettagli capelli',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'product',
    title: 'Prodotto / Sneakers',
    desc: 'E-commerce & Oggetti',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'pet',
    title: 'Animale / Gatto',
    desc: 'Pelo ed elementi fini',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'car',
    title: 'Auto Sportiva',
    desc: 'Superfici lucide',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop'
  }
];

export function SampleImages({ onSelectSample }) {
  return (
    <div style={{ marginTop: '20px', width: '100%', maxWidth: '750px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px',
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>
        <Sparkles size={13} color="var(--primary-accent)" />
        <span>Foto di test HD:</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px'
      }}>
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelectSample(sample.url)}
            className="panel-vercel"
            style={{
              padding: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              transition: 'border-color 0.15s ease, background 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflow: 'hidden',
              background: '#0a0a0a'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-accent)';
              e.currentTarget.style.background = '#111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = '#0a0a0a';
            }}
          >
            <div style={{
              width: '100%',
              height: '95px',
              borderRadius: '4px',
              overflow: 'hidden',
              background: '#050505',
              position: 'relative'
            }}>
              <img
                src={sample.url}
                alt={sample.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                loading="lazy"
              />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '12px', color: '#fff' }}>{sample.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{sample.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

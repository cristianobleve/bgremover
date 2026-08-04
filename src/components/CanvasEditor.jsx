import React, { useRef, useEffect, useState, useCallback } from 'react';
import { renderFinalOutput } from '../utils/aiBackground';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export function CanvasEditor({
  originalImg,
  maskCanvas,
  bgOption,
  bgImageObj,
  activeTool,
  brushSize,
  brushHardness,
  viewMode,
  showMaskOverlay,
  onMaskModified
}) {
  const containerRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const splitCanvasRef = useRef(null);

  // Zoom & Pan Viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Split-screen slider state (0 to 1)
  const [splitPos, setSplitPos] = useState(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Brush Cursor Indicator State
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  // Fit canvas into viewport on load
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !originalImg) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = (rect.width - 40) / originalImg.naturalWidth;
    const scaleY = (rect.height - 40) / originalImg.naturalHeight;
    const initialFit = Math.min(scaleX, scaleY, 1);
    setZoom(initialFit);
    setPan({ x: 0, y: 0 });
  }, [originalImg]);

  useEffect(() => {
    fitToScreen();
  }, [fitToScreen]);

  // Main Render Loop: Composite final output onto view canvas
  const renderCanvas = useCallback(() => {
    if (!mainCanvasRef.current || !originalImg || !maskCanvas) return;

    const canvas = mainCanvasRef.current;
    const width = originalImg.naturalWidth;
    const height = originalImg.naturalHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // 1. Render base output with current background option
    const composed = renderFinalOutput({
      originalImg,
      maskCanvas,
      bgOption,
      bgImageObj
    });

    ctx.drawImage(composed, 0, 0);

    // 2. Draw red translucent mask overlay if enabled
    if (showMaskOverlay) {
      const overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = width;
      overlayCanvas.height = height;
      const oCtx = overlayCanvas.getContext('2d');

      oCtx.fillStyle = 'rgba(255, 0, 60, 0.45)';
      oCtx.fillRect(0, 0, width, height);

      oCtx.globalCompositeOperation = 'destination-in';
      oCtx.drawImage(maskCanvas, 0, 0);

      ctx.drawImage(overlayCanvas, 0, 0);
    }

    // 3. Render Split View canvas if mode is split
    if (viewMode === 'split' && splitCanvasRef.current) {
      const splitCanvas = splitCanvasRef.current;
      splitCanvas.width = width;
      splitCanvas.height = height;
      const sCtx = splitCanvas.getContext('2d');

      // Draw composed result
      sCtx.drawImage(composed, 0, 0);

      // Clip left portion to reveal original HD image
      const splitX = width * splitPos;
      sCtx.save();
      sCtx.beginPath();
      sCtx.rect(0, 0, splitX, height);
      sCtx.clip();
      sCtx.drawImage(originalImg, 0, 0);
      sCtx.restore();

      // Draw dividing orangered line
      sCtx.strokeStyle = '#ff4500';
      sCtx.lineWidth = Math.max(2, width / 700);
      sCtx.beginPath();
      sCtx.moveTo(splitX, 0);
      sCtx.lineTo(splitX, height);
      sCtx.stroke();
    }
  }, [originalImg, maskCanvas, bgOption, bgImageObj, showMaskOverlay, viewMode, splitPos]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Map pointer coordinates from screen space into Full HD canvas space
  const getCanvasCoords = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Stroke Painting onto Mask Canvas
  const drawStroke = (from, to, pressure = 1.0) => {
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');

    const dynamicSize = brushSize * Math.max(0.4, pressure);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = dynamicSize;

    if (activeTool === 'restore') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(255, 255, 255, ${brushHardness / 100})`;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = (100 - brushHardness) * (brushSize / 100);
    } else if (activeTool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = `rgba(0, 0, 0, ${brushHardness / 100})`;
      ctx.shadowColor = 'rgba(0,0,0,1)';
      ctx.shadowBlur = (100 - brushHardness) * (brushSize / 100);
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();

    renderCanvas();
  };

  // Pointer Handlers
  const handlePointerDown = (e) => {
    if (activeTool === 'pan' || e.buttons === 4 || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (viewMode === 'split' && isNearSplitLine(e)) {
      setIsDraggingSplit(true);
      return;
    }

    if (activeTool === 'restore' || activeTool === 'erase') {
      isDrawingRef.current = true;
      const coords = getCanvasCoords(e);
      lastPointRef.current = coords;
      const pressure = e.pressure && e.pressure > 0 ? e.pressure : 1.0;
      drawStroke(coords, coords, pressure);
    }
  };

  const handlePointerMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY, visible: true });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (isDraggingSplit && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setSplitPos(Math.max(0.05, Math.min(0.95, pos)));
      return;
    }

    if (isDrawingRef.current && (activeTool === 'restore' || activeTool === 'erase')) {
      const coords = getCanvasCoords(e);
      const pressure = e.pressure && e.pressure > 0 ? e.pressure : 1.0;
      drawStroke(lastPointRef.current, coords, pressure);
      lastPointRef.current = coords;
    }
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      onMaskModified();
    }
    setIsPanning(false);
    setIsDraggingSplit(false);
  };

  const isNearSplitLine = (e) => {
    if (!containerRef.current) return false;
    const rect = containerRef.current.getBoundingClientRect();
    const currentSplitX = rect.left + rect.width * splitPos;
    return Math.abs(e.clientX - currentSplitX) < 30;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.1, Math.min(10, prev * zoomFactor)));
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setCursorPos((prev) => ({ ...prev, visible: false }));
      }}
      className="bg-checkerboard"
      style={{
        flex: 1,
        margin: '0 16px 12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: activeTool === 'pan' ? 'grab' : isPanning ? 'grabbing' : 'crosshair',
        touchAction: 'none'
      }}
    >
      {/* Zoomable & Pannable Viewport Wrapper */}
      <div style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: 'center center',
        transition: isPanning ? 'none' : 'transform 0.05s linear',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {viewMode === 'split' ? (
          <canvas
            ref={splitCanvasRef}
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              borderRadius: '4px'
            }}
          />
        ) : (
          <canvas
            ref={mainCanvasRef}
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              borderRadius: '4px'
            }}
          />
        )}
      </div>

      {/* Floating Zoom Bar Controls */}
      <div className="panel-vercel" style={{
        position: 'absolute',
        bottom: '16px',
        left: '20px',
        padding: '4px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '12px'
      }}>
        <button
          className="btn-vercel"
          style={{ padding: '4px' }}
          onClick={() => setZoom((z) => Math.max(0.1, z * 0.8))}
        >
          <ZoomOut size={13} />
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', minWidth: '45px', textAlign: 'center', color: 'var(--primary-accent)' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="btn-vercel"
          style={{ padding: '4px' }}
          onClick={() => setZoom((z) => Math.min(10, z * 1.25))}
        >
          <ZoomIn size={13} />
        </button>
        <button
          className="btn-vercel"
          style={{ padding: '4px' }}
          onClick={fitToScreen}
          title="Adatta allo schermo"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Brush Circle Cursor Indicator */}
      {cursorPos.visible && (activeTool === 'restore' || activeTool === 'erase') && (
        <div style={{
          position: 'fixed',
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          width: `${brushSize * zoom}px`,
          height: `${brushSize * zoom}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: activeTool === 'restore' ? '1px solid #ff4500' : '1px solid #ef4444',
          pointerEvents: 'none',
          zIndex: 1000
        }} />
      )}
    </div>
  );
}

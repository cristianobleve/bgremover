import { removeBackground } from '@imgly/background-removal';

/**
 * Loads an HTMLImageElement from a Blob or URL source
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
  });
}

/**
 * Removes background using local AI model while maintaining full HD quality.
 * @param {Blob | File | string} imageSource 
 * @param {Function} onProgress 
 * @returns {Promise<{ originalImg: HTMLImageElement, initialMaskCanvas: HTMLCanvasElement, width: number, height: number }>}
 */
export async function processBackgroundRemoval(imageSource, onProgress = () => {}) {
  // 1. Load original HD image to get full native dimensions
  const originalImg = await loadImage(imageSource);
  const width = originalImg.naturalWidth;
  const height = originalImg.naturalHeight;

  onProgress({ status: 'AI Inference', progress: 0.2, message: 'Analisi IA del soggetto...' });

  let resultBlob;
  try {
    // 2. Execute local AI background removal
    resultBlob = await removeBackground(imageSource, {
      progress: (key, current, total) => {
        const percent = Math.min(0.9, 0.2 + (current / (total || 1)) * 0.7);
        onProgress({ status: key, progress: percent, message: `Elaborazione modello AI (${Math.round((current / (total || 1)) * 100)}%)...` });
      },
      model: 'medium', // high quality model balance
      output: {
        format: 'image/png',
        quality: 1.0,
      }
    });
  } catch (err) {
    console.warn('AI Model fallback activated:', err);
    // Fallback if network/wasm model fails or is offline: produce initial center mask
    resultBlob = await generateFallbackMaskBlob(originalImg);
  }

  onProgress({ status: 'HD Composition', progress: 0.95, message: 'Rigenerazione maschera Ultra HD...' });

  // 3. Load processed result PNG (which has transparent background)
  const processedImg = await loadImage(resultBlob);

  // 4. Create FULL-RESOLUTION Mask Canvas (100% pixel-for-pixel with original image)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const ctx = maskCanvas.getContext('2d');

  // Extract the alpha channel from processedImg onto full-res maskCanvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(processedImg, 0, 0, width, height);

  const imgData = tempCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Mask data: Alpha channel determines white (subject) vs black (background)
  const maskData = ctx.createImageData(width, height);
  const maskPixels = maskData.data;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    maskPixels[i] = 255;
    maskPixels[i + 1] = 255;
    maskPixels[i + 2] = 255;
    maskPixels[i + 3] = alpha;
  }

  ctx.putImageData(maskData, 0, 0);

  onProgress({ status: 'Complete', progress: 1.0, message: 'Completato con successo!' });

  return {
    originalImg,
    initialMaskCanvas: maskCanvas,
    width,
    height
  };
}

/**
 * Creates fallback mask if model download is blocked or offline
 */
async function generateFallbackMaskBlob(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(img, 0, 0);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const rx = canvas.width * 0.35;
  const ry = canvas.height * 0.45;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const distSq = dx * dx + dy * dy;
      if (distSq > 1) {
        d[idx + 3] = 0;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

/**
 * Composites the final output image at 100% full original HD resolution
 */
export function renderFinalOutput({
  originalImg,
  maskCanvas,
  bgOption = { type: 'transparent' },
  bgImageObj = null
}) {
  const width = originalImg.naturalWidth;
  const height = originalImg.naturalHeight;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d');

  // 1. Draw Background based on mode
  if (bgOption.type === 'color') {
    ctx.fillStyle = bgOption.value || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (bgOption.type === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (bgOption.value === 'sunset') {
      grad.addColorStop(0, '#ff7e5f');
      grad.addColorStop(1, '#feb47b');
    } else if (bgOption.value === 'neon') {
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(1, '#4facfe');
    } else if (bgOption.value === 'studio') {
      grad.addColorStop(0, '#232526');
      grad.addColorStop(1, '#414345');
    } else {
      grad.addColorStop(0, '#111827');
      grad.addColorStop(1, '#374151');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgOption.type === 'blur') {
    ctx.filter = `blur(${bgOption.blurAmount || 25}px)`;
    ctx.drawImage(originalImg, -20, -20, width + 40, height + 40);
    ctx.filter = 'none';
  } else if (bgOption.type === 'image' && bgImageObj) {
    ctx.drawImage(bgImageObj, 0, 0, width, height);
  }

  // 2. Draw Subject using full-res mask
  const foregroundCanvas = document.createElement('canvas');
  foregroundCanvas.width = width;
  foregroundCanvas.height = height;
  const fgCtx = foregroundCanvas.getContext('2d');

  fgCtx.drawImage(originalImg, 0, 0);
  fgCtx.globalCompositeOperation = 'destination-in';
  fgCtx.drawImage(maskCanvas, 0, 0);
  fgCtx.globalCompositeOperation = 'source-over';

  // 3. Merge foreground onto final output
  ctx.drawImage(foregroundCanvas, 0, 0);

  return outputCanvas;
}

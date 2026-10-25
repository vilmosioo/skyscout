import React, { useEffect, useRef } from 'react';
import styles from './App.module.css';

export interface MiniDiffThumbnailProps {
  diaObjectId: string | number;
  classification?: string;
  flux?: number | null;
  size?: number;
}

/**
 * High-contrast inline astronomical CCD Difference Image (Diff) thumbnail.
 * Renders a point-spread function (PSF) and astrometric reticle centered on the transient.
 */
export function MiniDiffThumbnail({
  diaObjectId,
  classification,
  flux,
  size = 48,
}: MiniDiffThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const center = size / 2;
    const seed = String(diaObjectId)
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 17);

    const pseudoRandom = (n: number) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    // Scale intensity using flux if positive, or fallback to clear signal
    const intensity =
      typeof flux === 'number' && flux > 0
        ? Math.min(240, Math.max(120, Math.sqrt(flux) * 2.2))
        : 190;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const noise = (pseudoRandom(x * 19 + y * 29) - 0.5) * 14;
        let val = 22 + noise;

        // Difference PSF at center (Gaussian point-spread function)
        const dt = Math.hypot(x - center, y - center);
        const psf = Math.exp(-(dt * dt) / (2 * 2.1 * 2.1)) * intensity;
        val += psf;

        // Inverted Astronomical Grayscale (astronomy standard: white sky, dark point source)
        const inv = Math.max(0, Math.min(255, 255 - val * 1.15));
        data[idx] = inv;
        data[idx + 1] = inv;
        data[idx + 2] = inv;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Astrometric Reticle crosshair (subtle cyan/sky blue)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, 4, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center, center - 5);
    ctx.lineTo(center, center - 10);
    ctx.moveTo(center, center + 5);
    ctx.lineTo(center, center + 10);
    ctx.moveTo(center - 5, center);
    ctx.lineTo(center - 10, center);
    ctx.moveTo(center + 5, center);
    ctx.lineTo(center + 10, center);
    ctx.stroke();
  }, [diaObjectId, classification, flux, size]);

  return <canvas ref={canvasRef} width={size} height={size} className={styles.miniStampCanvas} />;
}

import React, { useState, useEffect, useRef } from 'react';
import {
  type RubinDiaSource,
  getLasairCutoutUrl,
} from '@skyscout/lasair-client';
import styles from './StampViewer.module.css';

/**
 * Properties for the {@link StampViewer} component.
 */
export interface StampViewerProps {
  /**
   * The individual Difference Image Analysis (DIA) source detection,
   * containing flux measurements (nJy), band filter, and photometric error.
   */
  source: RubinDiaSource;
  /**
   * The 64-bit Rubin DIA Object ID associated with this transient event.
   */
  objectId: string | number;
  /**
   * Optional flag indicating whether the application is running in offline demo mode.
   */
  isDemoMode?: boolean;
}

/**
 * Astronomical false-color mappings supported by the cutout canvas:
 * - `invert`: High-contrast negative grayscale (white sky background, dark stars)
 *   optimal for human optical contrast and faint host galaxy morphology.
 * - `gray`: Standard linear intensity map (black sky background, bright stars).
 * - `plasma`: Perceptually uniform viridis-family colormap (blue -> purple -> orange -> yellow)
 *   for quantitative dynamic range and PSF flux gradient evaluation.
 */
export type Colormap = 'invert' | 'gray' | 'plasma';

/**
 * Astronomical CCD Cutout Stamp Viewer (`StampViewer`).
 *
 * Visualizes the classic astronomical Difference Image Analysis (DIA) triplet:
 * 1. **Template**: Historical co-added reference exposure of the sky patch prior to transient eruption.
 * 2. **Science**: The new survey exposure containing the transient point-source plus host and field stars.
 * 3. **Difference (Diff)**: Point-Spread Function (PSF) matched subtracted image ($Science - Template$)
 *    leaving only the residual variable flux.
 *
 * Features:
 * - Real-time HTML5 Canvas rendering with simulated astronomical PSF and Poisson noise.
 * - Interactive astronomical colormap switching (`invert`, `gray`, `plasma`).
 * - Centroid astrometric reticle crosshair overlay for transient localization.
 * - Direct deep-links to official Lasair FITS cutouts for raw file downloading.
 *
 * @param props - {@link StampViewerProps}
 */
export function StampViewer({ source, objectId }: StampViewerProps) {
  const [colormap, setColormap] = useState<Colormap>('invert');
  const [showReticle, setShowReticle] = useState<boolean>(true);

  const templateRef = useRef<HTMLCanvasElement | null>(null);
  const scienceRef = useRef<HTMLCanvasElement | null>(null);
  const diffRef = useRef<HTMLCanvasElement | null>(null);

  // Draw astronomical cutouts on Canvas
  useEffect(() => {
    const size = 160;
    const center = size / 2;

    // Deterministic pseudo-random based on objectId
    const seed = String(objectId)
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 42);

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // Calculate intensity scaling from PSF flux
    const flux = source.psfFlux > 0 ? source.psfFlux : 2000;
    const peakIntensity = Math.min(240, Math.max(90, Math.sqrt(flux) * 2.0));

    // Render helper for an individual stamp
    const renderStamp = (
      canvas: HTMLCanvasElement | null,
      type: 'template' | 'science' | 'diff'
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgData = ctx.createImageData(size, size);
      const data = imgData.data;

      // Background stars positions
      const star1 = { x: center - 42, y: center - 35, b: 70 };
      const star2 = { x: center + 48, y: center + 38, b: 55 };

      // Host galaxy parameters (slightly offset from transient position)
      const hostX = center - 12;
      const hostY = center + 10;
      const hostRadius = 32;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;

          // Sky background noise (Poisson-like)
          const noise = (pseudoRandom(x * 17 + y * 31) - 0.5) * 16;
          let val = 24 + noise;

          if (type === 'template' || type === 'science') {
            // Draw host galaxy elliptical profile
            const dxH = (x - hostX) / 1.4;
            const dyH = (y - hostY) / 0.9;
            const distHost = Math.sqrt(dxH * dxH + dyH * dyH);
            if (distHost < hostRadius * 2) {
              const hostBrightness = Math.exp(-distHost / (hostRadius * 0.45)) * 120;
              val += hostBrightness;
            }

            // Draw field star 1
            const d1 = Math.hypot(x - star1.x, y - star1.y);
            val += Math.exp(-(d1 * d1) / 8) * star1.b;

            // Draw field star 2
            const d2 = Math.hypot(x - star2.x, y - star2.y);
            val += Math.exp(-(d2 * d2) / 6) * star2.b;
          }

          // Transient point-source (present in Science and Difference)
          if (type === 'science' || type === 'diff') {
            const dt = Math.hypot(x - center, y - center);
            // 2D Gaussian Point Spread Function (PSF, sigma ~ 2.8px)
            const psf = Math.exp(-(dt * dt) / (2 * 2.8 * 2.8)) * peakIntensity;
            val += psf;
          }

          // Apply selected astronomical colormap
          let r = 0;
          let g = 0;
          let b = 0;

          if (colormap === 'invert') {
            // Inverted Grayscale (Astronomical standard: white background, black sources)
            const inv = Math.max(0, Math.min(255, 255 - val * 1.1));
            r = inv;
            g = inv;
            b = inv;
          } else if (colormap === 'plasma') {
            // High-contrast plasma colormap
            const norm = Math.max(0, Math.min(1, val / 255));
            r = Math.min(255, norm * 350);
            g = Math.min(255, Math.pow(norm, 1.8) * 255);
            b = Math.min(255, Math.sin(norm * Math.PI) * 220 + 40);
          } else {
            // Standard night-sky grayscale
            const norm = Math.max(0, Math.min(255, val));
            r = norm;
            g = norm;
            b = norm;
          }

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Render Reticle Crosshair
      if (showReticle) {
        const reticleColor = colormap === 'invert' ? 'rgba(2, 132, 199, 0.85)' : 'rgba(56, 189, 248, 0.85)';
        ctx.strokeStyle = reticleColor;
        ctx.lineWidth = 1.2;

        // Central target aperture circle
        ctx.beginPath();
        ctx.arc(center, center, 8, 0, 2 * Math.PI);
        ctx.stroke();

        // 4 crosshair ticks
        ctx.beginPath();
        // Top tick
        ctx.moveTo(center, center - 12);
        ctx.lineTo(center, center - 24);
        // Bottom tick
        ctx.moveTo(center, center + 12);
        ctx.lineTo(center, center + 24);
        // Left tick
        ctx.moveTo(center - 12, center);
        ctx.lineTo(center - 24, center);
        // Right tick
        ctx.moveTo(center + 12, center);
        ctx.lineTo(center + 24, center);
        ctx.stroke();
      }
    };

    renderStamp(templateRef.current, 'template');
    renderStamp(scienceRef.current, 'science');
    renderStamp(diffRef.current, 'diff');
  }, [source, objectId, colormap, showReticle]);

  return (
    <div className={styles.stampTripletContainer}>
      <div className={styles.stampTripletHeader}>
        <div className={styles.stampTitleGroup}>
          <span className={styles.stampLabel}>DIA Cutout Image Triplet</span>
          <span className={styles.stampMeta}>
            Epoch Source: <code className="mono">{source.diaSourceId}</code> • Filter: <strong>{source.band}-band</strong> • MJD: {source.midpointMjdTai.toFixed(2)}
          </span>
        </div>

        <div className={styles.stampControls}>
          <div className={styles.colormapSelector}>
            <span className={styles.controlLabel}>Colormap:</span>
            <button
              className={`${styles.pillBtn} ${colormap === 'invert' ? styles.pillBtnActive : ''}`}
              onClick={() => setColormap('invert')}
              title="Astronomical inverted grayscale (standard for spotting faint residuals)"
            >
              Inverted
            </button>
            <button
              className={`${styles.pillBtn} ${colormap === 'plasma' ? styles.pillBtnActive : ''}`}
              onClick={() => setColormap('plasma')}
              title="High-contrast false color"
            >
              Plasma
            </button>
            <button
              className={`${styles.pillBtn} ${colormap === 'gray' ? styles.pillBtnActive : ''}`}
              onClick={() => setColormap('gray')}
              title="Night-sky grayscale"
            >
              Grayscale
            </button>
          </div>

          <button
            className={`${styles.pillBtn} ${showReticle ? styles.pillBtnActive : ''}`}
            onClick={() => setShowReticle(!showReticle)}
            title="Toggle coordinate crosshair reticle"
          >
            🎯 Reticle {showReticle ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className={styles.stampsGrid}>
        {/* Template Image */}
        <div className={styles.stampCard}>
          <div className={styles.stampCardHeader}>
            <span className={`${styles.stampBadge} ${styles.stampBadgeTemplate}`}>Template</span>
            <span className={styles.stampCaption}>Historical Reference</span>
          </div>
          <div className={styles.canvasWrapper}>
            <canvas ref={templateRef} width={160} height={160} className={styles.stampCanvas} />
          </div>
          <div className={styles.stampFooter}>
            <span className={styles.stampNote}>Pre-transient sky + host</span>
            <a
              href={getLasairCutoutUrl(source.diaSourceId, 'Template')}
              target="_blank"
              rel="noreferrer"
              className={styles.stampLink}
              title="Download Lasair FITS Template cutout"
            >
              FITS ↗
            </a>
          </div>
        </div>

        {/* Science Image */}
        <div className={styles.stampCard}>
          <div className={styles.stampCardHeader}>
            <span className={`${styles.stampBadge} ${styles.stampBadgeScience}`}>Science</span>
            <span className={styles.stampCaption}>Observation Visit</span>
          </div>
          <div className={styles.canvasWrapper}>
            <canvas ref={scienceRef} width={160} height={160} className={styles.stampCanvas} />
          </div>
          <div className={styles.stampFooter}>
            <span className={styles.stampNote}>New exposure + transient</span>
            <a
              href={getLasairCutoutUrl(source.diaSourceId, 'Science')}
              target="_blank"
              rel="noreferrer"
              className={styles.stampLink}
              title="Download Lasair FITS Science cutout"
            >
              FITS ↗
            </a>
          </div>
        </div>

        {/* Difference Image (Diff) */}
        <div className={`${styles.stampCard} ${styles.highlightDiff}`}>
          <div className={styles.stampCardHeader}>
            <span className={`${styles.stampBadge} ${styles.stampBadgeDiff}`}>⚡ Difference (Diff)</span>
            <span className={styles.stampCaption}>Science − Template</span>
          </div>
          <div className={styles.canvasWrapper}>
            <canvas ref={diffRef} width={160} height={160} className={styles.stampCanvas} />
          </div>
          <div className={styles.stampFooter}>
            <span className={styles.stampNote}>Residual transient flux</span>
            <a
              href={getLasairCutoutUrl(source.diaSourceId, 'Difference')}
              target="_blank"
              rel="noreferrer"
              className={`${styles.stampLink} ${styles.stampLinkBold}`}
              title="Download Lasair FITS Difference cutout"
            >
              Diff FITS ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

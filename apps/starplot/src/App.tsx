import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  fetchTargetStars,
  starToCanvasXY,
  TARGET_PRESETS,
  toggleTargetSelection,
  type TargetPresetId,
} from './hrPlot';

const PADDING = { left: 64, top: 44, right: 32, bottom: 52 };

export default function App() {
  // Use Vite dev proxy `/gaia-tap` in browser dev mode so ESA Gaia TAP requests never hit CORS issues
  const client = useMemo(() => {
    const endpoint = import.meta.env.VITE_GAIA_ENDPOINT || '/gaia-tap';
    return new GaiaClient({ endpoint });
  }, []);

  const [selectedTargets, setSelectedTargets] = useState<TargetPresetId[]>(['neighborhood']);
  const [stars, setStars] = useState<GaiaStar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [hovered, setHovered] = useState<{
    star: GaiaStar;
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch (or read from localStorage cache) stars for all selected targets and merge by sourceId
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHovered(null);
    const t0 = performance.now();

    Promise.all(selectedTargets.map((id) => fetchTargetStars(client, id, 1000)))
      .then((results) => {
        if (cancelled) return;
        const uniqueMap = new Map<string, GaiaStar>();
        for (const list of results) {
          for (const star of list) {
            uniqueMap.set(star.sourceId, star);
          }
        }
        setStars(Array.from(uniqueMap.values()));
        setElapsedMs(Math.round(performance.now() - t0));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError((err as Error).message || 'Failed to query ESA Gaia TAP.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, selectedTargets]);

  // Draw the H–R Diagram onto the HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const box = {
      left: PADDING.left,
      top: PADDING.top,
      width: width - PADDING.left - PADDING.right,
      height: height - PADDING.top - PADDING.bottom,
    };

    // 1. Background
    ctx.fillStyle = '#0b101c';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle grid & axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';

    // X-axis ticks: Color Index (G_BP - G_RP)
    for (let c = -0.5; c <= 3.5; c += 0.5) {
      const { x } = starToCanvasXY(c, 0, box);
      ctx.beginPath();
      ctx.moveTo(x, box.top);
      ctx.lineTo(x, box.top + box.height);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillText(c.toFixed(1), x, box.top + box.height + 20);
    }

    // Y-axis ticks: Absolute Magnitude (M_G, inverted)
    for (let m = -4; m <= 16; m += 2) {
      const { y } = starToCanvasXY(0, m, box);
      ctx.beginPath();
      ctx.moveTo(box.left, y);
      ctx.lineTo(box.left + box.width, y);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillText(`${m > 0 ? '+' : ''}${m}`, box.left - 10, y + 4);
    }

    // Spectral classes along top margin
    const spectralGuides: Array<{ label: string; bpRp: number }> = [
      { label: 'B', bpRp: -0.15 },
      { label: 'A', bpRp: 0.15 },
      { label: 'F', bpRp: 0.5 },
      { label: 'G (Sun)', bpRp: 0.82 },
      { label: 'K', bpRp: 1.35 },
      { label: 'M', bpRp: 2.4 },
    ];
    ctx.textAlign = 'center';
    for (const sp of spectralGuides) {
      const { x } = starToCanvasXY(sp.bpRp, 0, box);
      ctx.fillStyle = bpRpToStarHexColor(sp.bpRp);
      ctx.fillText(sp.label, x, box.top - 12);
    }

    // Evolutionary region watermarks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.font = '600 11px "Inter", sans-serif';
    const msPos = starToCanvasXY(1.5, 7.8, box);
    ctx.fillText('MAIN SEQUENCE', msPos.x, msPos.y);

    const rgPos = starToCanvasXY(1.45, 0.4, box);
    ctx.fillText('RED GIANTS', rgPos.x, rgPos.y);

    const wdPos = starToCanvasXY(0.15, 13.0, box);
    ctx.fillText('WHITE DWARFS', wdPos.x, wdPos.y);

    // Reference marker for the Sun (G_BP - G_RP = 0.82, M_G = 4.67)
    const sunPos = starToCanvasXY(0.82, 4.67, box);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.75)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('☉ Sun', sunPos.x + 9, sunPos.y + 3);

    // 3. Plot live Gaia stars
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.left, box.top, box.width, box.height);
    ctx.clip();

    for (const star of stars) {
      if (star.bpRp === null || star.absoluteMagG === null) continue;
      const { x, y } = starToCanvasXY(star.bpRp, star.absoluteMagG, box);

      const color = bpRpToStarHexColor(star.bpRp);
      // Brighter stars get a slightly larger point radius (1.8px to 3.8px)
      const radius = Math.max(1.8, Math.min(3.8, (14 - star.absoluteMagG) * 0.22));

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.88;
      ctx.fill();
    }

    // Highlight hovered star
    if (hovered && hovered.star.bpRp !== null && hovered.star.absoluteMagG !== null) {
      const { x, y } = starToCanvasXY(hovered.star.bpRp, hovered.star.absoluteMagG, box);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Axis titles
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Color Index (G_BP − G_RP)  [← Hot Blue  |  Cool Red →]',
      box.left + box.width / 2,
      height - 14
    );

    ctx.save();
    ctx.translate(18, box.top + box.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Absolute Magnitude (M_G)  [← Faint  |  Bright →]', 0, 0);
    ctx.restore();
  }, [stars, hovered]);

  // Nearest-star hover inspection on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || stars.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const box = {
      left: PADDING.left,
      top: PADDING.top,
      width: rect.width - PADDING.left - PADDING.right,
      height: rect.height - PADDING.top - PADDING.bottom,
    };

    let closest: GaiaStar | null = null;
    let minDistSq = 100; // 10px hover radius

    for (const star of stars) {
      if (star.bpRp === null || star.absoluteMagG === null) continue;
      const { x, y } = starToCanvasXY(star.bpRp, star.absoluteMagG, box);
      const dx = x - mouseX;
      const dy = y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < minDistSq) {
        minDistSq = d2;
        closest = star;
      }
    }

    if (closest) {
      setHovered({ star: closest, x: mouseX, y: mouseY });
    } else {
      setHovered(null);
    }
  };

  const activeLabels = TARGET_PRESETS.filter((p) => selectedTargets.includes(p.id))
    .map((p) => p.label)
    .join(' + ');

  return (
    <div className="app">
      <header className="header">
        <div className="title-group">
          <h1>
            ✨ StarPlot <span className="badge">ESA Gaia DR3 Live</span>
          </h1>
          <p className="subtitle">{activeLabels}</p>
        </div>

        <div className="presets">
          {TARGET_PRESETS.map((preset) => {
            const isSelected = selectedTargets.includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedTargets((prev) => toggleTargetSelection(prev, preset.id))
                }
                className={`preset-btn ${isSelected ? 'active' : ''}`}
              >
                {isSelected ? '✓ ' : '+ '}
                {preset.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="status-bar">
        <span>
          {loading
            ? `Loading ${activeLabels}...`
            : `Plotted ${stars.length.toLocaleString()} stars (${selectedTargets.length} ${
                selectedTargets.length === 1 ? 'source' : 'sources'
              } selected)`}
        </span>
        {elapsedMs !== null && !loading && (
          <span>{elapsedMs < 15 ? `Cached (${elapsedMs} ms)` : `Query time: ${elapsedMs} ms`}</span>
        )}
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="plot-card">
        <canvas
          ref={canvasRef}
          className="canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
        />

        {hovered && (
          <div
            className="tooltip"
            style={{
              left: Math.min(hovered.x + 14, 820),
              top: Math.max(hovered.y - 70, 12),
            }}
          >
            <div>
              <strong>Gaia DR3 {hovered.star.sourceId}</strong> ({hovered.star.spectralClass}-type)
            </div>
            <div>
              M_G: {hovered.star.absoluteMagG?.toFixed(2)} mag (G = {hovered.star.magG.toFixed(2)})
            </div>
            <div>
              BP − RP: {hovered.star.bpRp?.toFixed(2)} | T_eff: ~{hovered.star.teffK} K
            </div>
            <div>
              Distance: {hovered.star.distancePc?.toFixed(1)} pc (
              {hovered.star.distanceLy?.toFixed(1)} ly)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

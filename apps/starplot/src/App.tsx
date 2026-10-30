import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDms, formatHms } from '@skyscout/core';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  COLOR_SCHEMES,
  type ColorSchemeId,
  computeStarCanvasRadius,
  fetchTargetStars,
  findClosestStarAtPoint,
  getGaiaStarExternalUrls,
  getStarPhysicalDetails,
  HR_BOUNDS,
  type HrBounds,
  panHrBounds,
  type PlotBox,
  starToCanvasXY,
  TARGET_PRESETS,
  type TargetCategory,
  type TargetPresetId,
  toggleTargetSelection,
  zoomHrBounds,
} from './hrPlot';

const PADDING = { left: 78, top: 56, right: 64, bottom: 52 };

interface TaggedStar {
  star: GaiaStar;
  sourceLabel: string;
}

/**
 * Shared H–R diagram renderer used for both the live interactive canvas
 * and the high-resolution print poster export, styled after Richard Powell's
 * classic Wikipedia Hertzsprung–Russell diagram.
 */
function renderHrDiagramCanvas(options: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  box: PlotBox;
  bounds: HrBounds;
  schemeId: ColorSchemeId;
  stars: TaggedStar[];
  hoveredStar?: GaiaStar | null;
  posterHeader?: {
    title: string;
    subtitle: string;
  };
}) {
  const { ctx, width, height, box, bounds, schemeId, stars, hoveredStar, posterHeader } = options;
  const scheme = COLOR_SCHEMES[schemeId];
  const scale = posterHeader ? 2.2 : 1;
  const isLightTheme = schemeId === 'print-light';

  // 1. Pitch-black (or scheme) background
  ctx.fillStyle = scheme.canvasBg;
  ctx.fillRect(0, 0, width, height);

  // Optional Poster Title Header & Footer
  if (posterHeader) {
    ctx.fillStyle = scheme.titleTextColor;
    ctx.font = `700 ${Math.round(28 * scale)}px "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(posterHeader.title, box.left, Math.round(52 * scale));

    ctx.fillStyle = scheme.axisTextColor;
    ctx.font = `400 ${Math.round(13 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillText(posterHeader.subtitle, box.left, Math.round(76 * scale));

    ctx.textAlign = 'right';
    ctx.fillText(
      `${stars.length.toLocaleString()} Stars · ESA Gaia DR3 · SkyScout StarPlot`,
      box.left + box.width,
      Math.round(76 * scale)
    );
  }

  // 2. Top Spectral Class & Surface Temperature Header (O B A F G K M + Kelvin ticks)
  const spectralHeader: Array<{ cls: string; bpRp: number; temp: string }> = [
    { cls: 'O', bpRp: -0.42, temp: '30000K' },
    { cls: 'B', bpRp: -0.15, temp: '10000K' },
    { cls: 'A', bpRp: 0.12, temp: '7500K' },
    { cls: 'F', bpRp: 0.45, temp: '6000K' },
    { cls: 'G', bpRp: 0.82, temp: '5000K' },
    { cls: 'K', bpRp: 1.32, temp: '4000K' },
    { cls: 'M', bpRp: 2.15, temp: '3000K' },
  ];

  ctx.textAlign = 'center';
  for (const sp of spectralHeader) {
    const { x } = starToCanvasXY(sp.bpRp, 0, box, bounds);
    if (x >= box.left + 8 && x <= box.left + box.width - 8) {
      // Spectral class letter (colored by stellar temperature)
      ctx.font = `700 ${Math.round(12 * scale)}px "Inter", sans-serif`;
      ctx.fillStyle = bpRpToStarHexColor(sp.bpRp, schemeId);
      ctx.fillText(sp.cls, x, box.top - 24 * scale);

      // Top tick mark + Kelvin label
      ctx.strokeStyle = scheme.axisTextColor;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(x, box.top);
      ctx.lineTo(x, box.top - 5 * scale);
      ctx.stroke();

      ctx.font = `${Math.round(10 * scale)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = scheme.axisTextColor;
      ctx.fillText(sp.temp, x, box.top - 9 * scale);
    }
  }

  // 3. Bottom X-axis ticks: Color Index (G_BP - G_RP)
  ctx.strokeStyle = scheme.axisTextColor;
  ctx.fillStyle = scheme.axisTextColor;
  ctx.lineWidth = 1 * scale;
  ctx.font = `${Math.round(10.5 * scale)}px "JetBrains Mono", monospace`;

  const xStep = bounds.maxBpRp - bounds.minBpRp > 1.8 ? 0.5 : 0.2;
  const firstX = Math.ceil(bounds.minBpRp / xStep) * xStep;
  for (let c = firstX; c <= bounds.maxBpRp + 1e-6; c += xStep) {
    const { x } = starToCanvasXY(c, 0, box, bounds);
    if (x < box.left || x > box.left + box.width) continue;

    // Outer bottom tick
    ctx.beginPath();
    ctx.moveTo(x, box.top + box.height);
    ctx.lineTo(x, box.top + box.height + 6 * scale);
    ctx.stroke();

    ctx.textAlign = 'center';
    const prefix = c > 0.001 ? '+' : '';
    ctx.fillText(`${prefix}${c.toFixed(xStep < 0.5 ? 2 : 1)}`, x, box.top + box.height + 19 * scale);
  }

  // 4. Right Y-axis ticks: Absolute Magnitude (M_G) & Left Y-axis ticks: Luminosity (Sun = 1)
  const yStep = bounds.maxAbsMag - bounds.minAbsMag > 10 ? 5 : 2;
  const firstY = Math.ceil(bounds.minAbsMag / yStep) * yStep;
  for (let m = firstY; m <= bounds.maxAbsMag + 1e-6; m += yStep) {
    const { y } = starToCanvasXY(0, m, box, bounds);
    if (y < box.top || y > box.top + box.height) continue;

    // Right tick (Absolute Magnitude)
    ctx.strokeStyle = scheme.axisTextColor;
    ctx.beginPath();
    ctx.moveTo(box.left + box.width, y);
    ctx.lineTo(box.left + box.width + 6 * scale, y);
    ctx.stroke();

    ctx.fillStyle = scheme.titleTextColor;
    ctx.textAlign = 'left';
    ctx.fillText(`${m > 0 ? '+' : ''}${m}`, box.left + box.width + 10 * scale, y + 3.5 * scale);
  }

  // Left Y-axis decade ticks: Solar Luminosity (L / L_sun = 10^(0.4 * (4.67 - M_G)))
  const lumDecades: Array<{ lumLabel: string; logLum: number }> = [
    { lumLabel: '100 000', logLum: 5 },
    { lumLabel: '10 000', logLum: 4 },
    { lumLabel: '1000', logLum: 3 },
    { lumLabel: '100', logLum: 2 },
    { lumLabel: '10', logLum: 1 },
    { lumLabel: '1', logLum: 0 },
    { lumLabel: '0.1', logLum: -1 },
    { lumLabel: '0.01', logLum: -2 },
    { lumLabel: '0.001', logLum: -3 },
    { lumLabel: '0.0001', logLum: -4 },
  ];
  for (const dec of lumDecades) {
    const absMag = 4.67 - 2.5 * dec.logLum;
    const { y } = starToCanvasXY(0, absMag, box, bounds);
    if (y < box.top + 6 || y > box.top + box.height - 6) continue;

    ctx.strokeStyle = scheme.axisTextColor;
    ctx.beginPath();
    ctx.moveTo(box.left - 6 * scale, y);
    ctx.lineTo(box.left, y);
    ctx.stroke();

    ctx.fillStyle = scheme.titleTextColor;
    ctx.textAlign = 'right';
    ctx.fillText(dec.lumLabel, box.left - 10 * scale, y + 3.5 * scale);
  }

  // Clip interior plot region
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.left, box.top, box.width, box.height);
  ctx.clip();

  // 5. Plot live Gaia stars first as fine stardust points
  ctx.save();
  if (!isLightTheme) {
    ctx.globalCompositeOperation = 'lighter';
  }
  for (const { star } of stars) {
    if (star.bpRp === null || star.absoluteMagG === null) continue;
    const { x, y } = starToCanvasXY(star.bpRp, star.absoluteMagG, box, bounds);
    if (x < box.left - 6 || x > box.left + box.width + 6) continue;
    if (y < box.top - 6 || y > box.top + box.height + 6) continue;

    const color = bpRpToStarHexColor(star.bpRp, schemeId);
    const radius = computeStarCanvasRadius(star.absoluteMagG, scale);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = isLightTheme ? 0.82 : 0.78;
    ctx.fill();
  }
  ctx.restore();

  // Highlight hovered star
  if (hoveredStar && hoveredStar.bpRp !== null && hoveredStar.absoluteMagG !== null) {
    const { x, y } = starToCanvasXY(hoveredStar.bpRp, hoveredStar.absoluteMagG, box, bounds);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Crisp outer plot frame border (Wikipedia / Powell style)
  ctx.strokeStyle = isLightTheme ? '#334155' : 'rgba(203, 213, 225, 0.75)';
  ctx.lineWidth = 1.2 * scale;
  ctx.strokeRect(box.left, box.top, box.width, box.height);

  // Axis titles
  ctx.fillStyle = scheme.axisTextColor;
  ctx.font = `500 ${Math.round(11.5 * scale)}px "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Colour Index (G_BP − G_RP)', box.left + box.width / 2, height - 12 * scale);

  ctx.fillStyle = scheme.titleTextColor;
  ctx.save();
  ctx.translate(16 * scale, box.top + box.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Luminosity (Sun = 1)', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(width - 14 * scale, box.top + box.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('Absolute Magnitude (M_G)', 0, 0);
  ctx.restore();
}

export default function App() {
  const client = useMemo(() => {
    const endpoint = import.meta.env.VITE_GAIA_ENDPOINT || '/gaia-tap';
    return new GaiaClient({ endpoint });
  }, []);

  const [selectedTargets, setSelectedTargets] = useState<TargetPresetId[]>(['solar-50pc']);
  const [schemeId, setSchemeId] = useState<ColorSchemeId>('blackbody');
  const [bounds, setBounds] = useState<HrBounds>(HR_BOUNDS);
  const [taggedStars, setTaggedStars] = useState<TaggedStar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const [hovered, setHovered] = useState<{
    item: TaggedStar;
    x: number;
    y: number;
  } | null>(null);
  const [pinned, setPinned] = useState<{
    item: TaggedStar;
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStateRef = useRef<{
    dragging: boolean;
    moved: boolean;
    lastX: number;
    lastY: number;
  }>({
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
  });

  // Fetch (or read from localStorage cache) stars for all selected targets
  useEffect(() => {
    if (selectedTargets.length === 0) {
      setTaggedStars([]);
      setLoading(false);
      setElapsedMs(null);
      setHovered(null);
      setPinned(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    const t0 = performance.now();

    Promise.all(
      selectedTargets.map(async (id) => {
        const preset = TARGET_PRESETS.find((p) => p.id === id);
        const list = await fetchTargetStars(client, id, 1000);
        return { sourceLabel: preset?.shortName ?? id, list };
      })
    )
      .then((results) => {
        if (cancelled) return;
        const uniqueMap = new Map<string, TaggedStar>();
        for (const { sourceLabel, list } of results) {
          for (const star of list) {
            uniqueMap.set(star.sourceId, { star, sourceLabel });
          }
        }
        setTaggedStars(Array.from(uniqueMap.values()));
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

  const activeStarSelection = pinned ?? hovered;

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
    const box: PlotBox = {
      left: PADDING.left,
      top: PADDING.top,
      width: width - PADDING.left - PADDING.right,
      height: height - PADDING.top - PADDING.bottom,
    };

    renderHrDiagramCanvas({
      ctx,
      width,
      height,
      box,
      bounds,
      schemeId,
      stars: taggedStars,
      hoveredStar: activeStarSelection?.item.star ?? null,
    });
  }, [taggedStars, activeStarSelection, bounds, schemeId]);

  // Mouse wheel zoom centered at cursor position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const boxWidth = rect.width - PADDING.left - PADDING.right;
      const boxHeight = rect.height - PADDING.top - PADDING.bottom;

      const anchorXNorm = Math.max(0, Math.min(1, (e.clientX - rect.left - PADDING.left) / boxWidth));
      const anchorYNorm = Math.max(0, Math.min(1, (e.clientY - rect.top - PADDING.top) / boxHeight));
      const scaleFactor = e.deltaY < 0 ? 0.84 : 1.19;

      setBounds((prev) => zoomHrBounds(prev, scaleFactor, anchorXNorm, anchorYNorm));
      setHovered(null);
      setPinned(null);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragStateRef.current = {
      dragging: true,
      moved: false,
      lastX: e.clientX,
      lastY: e.clientY,
    };
  };

  const handleMouseUp = () => {
    const wasMoved = dragStateRef.current.moved;
    dragStateRef.current.dragging = false;

    if (!wasMoved) {
      // Clicking a star pins its inspector popup so external links can be clicked;
      // clicking empty canvas unpins.
      if (hovered) {
        setPinned((prev) =>
          prev?.item.star.sourceId === hovered.item.star.sourceId ? null : hovered
        );
      } else {
        setPinned(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const box: PlotBox = {
      left: PADDING.left,
      top: PADDING.top,
      width: rect.width - PADDING.left - PADDING.right,
      height: rect.height - PADDING.top - PADDING.bottom,
    };

    if (dragStateRef.current.dragging) {
      const dx = e.clientX - dragStateRef.current.lastX;
      const dy = e.clientY - dragStateRef.current.lastY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragStateRef.current.moved = true;
      }
      dragStateRef.current.lastX = e.clientX;
      dragStateRef.current.lastY = e.clientY;
      setBounds((prev) => panHrBounds(prev, dx, dy, box));
      setHovered(null);
      setPinned(null);
      return;
    }

    if (taggedStars.length === 0) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const closest = findClosestStarAtPoint(taggedStars, mouseX, mouseY, box, bounds, 12);

    if (closest) {
      setHovered({ item: closest, x: mouseX, y: mouseY });
    } else {
      setHovered(null);
    }
  };

  const activePresets = useMemo(
    () => TARGET_PRESETS.filter((p) => selectedTargets.includes(p.id)),
    [selectedTargets]
  );

  const activeTitle =
    activePresets.length > 0
      ? activePresets.map((p) => p.shortName).join(' + ')
      : 'No sources selected — click any cluster below to plot';

  // Export High-Resolution Print Poster (3600 x 2400 px PNG)
  const handleExportPoster = useCallback(() => {
    const width = 3000;
    const height = 2100;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    const posterBox: PlotBox = {
      left: 160,
      top: 220,
      width: width - 240,
      height: height - 340,
    };

    renderHrDiagramCanvas({
      ctx,
      width,
      height,
      box: posterBox,
      bounds,
      schemeId,
      stars: taggedStars,
      posterHeader: {
        title: 'HERTZSPRUNG–RUSSELL DIAGRAM',
        subtitle: activePresets.map((p) => `${p.label} (${p.age})`).join('  •  '),
      },
    });

    const dataUrl = offscreen.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    const slug = selectedTargets.slice(0, 3).join('-');
    link.download = `starplot-hr-poster-${slug}-${schemeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activePresets, bounds, schemeId, selectedTargets, taggedStars]);

  const categories: TargetCategory[] = ['Solar Volume', 'Open Cluster', 'Globular Cluster'];

  const isZoomed =
    Math.abs(bounds.minBpRp - HR_BOUNDS.minBpRp) > 0.01 ||
    Math.abs(bounds.maxBpRp - HR_BOUNDS.maxBpRp) > 0.01 ||
    Math.abs(bounds.minAbsMag - HR_BOUNDS.minAbsMag) > 0.01 ||
    Math.abs(bounds.maxAbsMag - HR_BOUNDS.maxAbsMag) > 0.01;

  const inspectedDetails = activeStarSelection
    ? getStarPhysicalDetails(activeStarSelection.item.star)
    : null;
  const inspectedUrls = activeStarSelection
    ? getGaiaStarExternalUrls(activeStarSelection.item.star)
    : null;

  return (
    <div className="app">
      <header className="header">
        <div className="title-group">
          <h1>
            ✨ StarPlot <span className="badge">ESA Gaia DR3 Live</span>
          </h1>
          <p className="subtitle">{activeTitle}</p>
        </div>

        <div className="toolbar-actions">
          <select
            aria-label="Color Scheme"
            value={schemeId}
            onChange={(e) => setSchemeId(e.target.value as ColorSchemeId)}
            className="select-control"
          >
            {Object.values(COLOR_SCHEMES).map((s) => (
              <option key={s.id} value={s.id}>
                🎨 Theme: {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportPoster}
            className="action-btn primary"
            title="Export a 3000×2100 high-resolution poster PNG for printing"
          >
            🖼️ Export Print Poster (PNG)
          </button>
        </div>
      </header>

      {/* Multi-Source Messier & Famous Clusters Selector */}
      <section className="catalog-panel">
        <div className="catalog-header">
          <span className="catalog-title">
            Stellar Groups & Messier Catalog ({selectedTargets.length} / {TARGET_PRESETS.length}{' '}
            selected)
          </span>
          <div className="bulk-actions">
            <button
              type="button"
              className="bulk-btn"
              disabled={selectedTargets.length === TARGET_PRESETS.length}
              onClick={() => setSelectedTargets(TARGET_PRESETS.map((p) => p.id))}
            >
              ✓ Select All
            </button>
            <button
              type="button"
              className="bulk-btn"
              disabled={selectedTargets.length === 0}
              onClick={() => setSelectedTargets([])}
            >
              ✕ Select None
            </button>
          </div>
        </div>

        {categories.map((category) => (
          <div key={category} className="category-row">
            <span className="category-label">{category}:</span>
            {TARGET_PRESETS.filter((p) => p.category === category).map((preset) => {
              const isSelected = selectedTargets.includes(preset.id);
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={`${preset.label} — ${preset.subtitle} (${preset.age})`}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedTargets((prev) => toggleTargetSelection(prev, preset.id))
                  }
                  className={`preset-btn ${isSelected ? 'active' : ''}`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {preset.shortName}
                </button>
              );
            })}
          </div>
        ))}
      </section>

      <div className="status-bar">
        <span>
          {loading
            ? `Fetching ESA Gaia TAP (${activeTitle})...`
            : `Plotted ${taggedStars.length.toLocaleString()} stars across ${selectedTargets.length} ${
                selectedTargets.length === 1 ? 'source' : 'sources'
              }`}
          {elapsedMs !== null &&
            !loading &&
            ` · ${elapsedMs < 15 ? `Cached (${elapsedMs} ms)` : `${elapsedMs} ms`}`}
        </span>

        <div className="zoom-controls">
          <span>Scroll to zoom · Drag to pan · Click star to pin links</span>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setBounds((b) => zoomHrBounds(b, 0.75))}
          >
            ＋ Zoom In
          </button>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setBounds((b) => zoomHrBounds(b, 1.33))}
          >
            － Zoom Out
          </button>
          {isZoomed && (
            <button
              type="button"
              className="zoom-btn"
              onClick={() => setBounds(HR_BOUNDS)}
            >
              ↺ Reset View
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="plot-card">
        <canvas
          ref={canvasRef}
          className={`canvas ${loading ? 'loading' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            dragStateRef.current.dragging = false;
            setHovered(null);
          }}
        />

        {loading && (
          <div className="canvas-loader" role="status" aria-live="polite">
            <span className="spinner-dot" />
            <span>Fetching Gaia DR3 photometry...</span>
          </div>
        )}

        {!loading && selectedTargets.length === 0 && (
          <div className="empty-overlay">
            Select one or more stellar groups above to plot on the H–R diagram
          </div>
        )}

        {activeStarSelection && inspectedDetails && inspectedUrls && (
          <div
            className={`tooltip ${pinned ? 'pinned' : ''}`}
            style={{
              left: Math.min(activeStarSelection.x + 16, 820),
              top: Math.min(Math.max(activeStarSelection.y - 120, 12), 360),
            }}
          >
            <div className="tooltip-header">
              <div className="star-swatch-row">
                <span
                  className="star-swatch"
                  style={{
                    backgroundColor: bpRpToStarHexColor(
                      activeStarSelection.item.star.bpRp ?? 0.8,
                      schemeId
                    ),
                    boxShadow: `0 0 10px ${bpRpToStarHexColor(
                      activeStarSelection.item.star.bpRp ?? 0.8,
                      schemeId
                    )}`,
                  }}
                />
                <div>
                  <div className="tooltip-id">
                    Gaia DR3 {activeStarSelection.item.star.sourceId}
                  </div>
                  <div className="tooltip-stage">
                    {inspectedDetails.evolutionaryStage} · {activeStarSelection.item.sourceLabel}
                  </div>
                </div>
              </div>
              <span className="spectral-pill">
                {activeStarSelection.item.star.spectralClass}-Type
              </span>
            </div>

            <div className="tooltip-grid">
              <div className="tooltip-metric">
                <span>Abs / App Mag</span>
                <strong>
                  {activeStarSelection.item.star.absoluteMagG?.toFixed(2)} /{' '}
                  {activeStarSelection.item.star.magG.toFixed(2)}
                </strong>
              </div>
              <div className="tooltip-metric">
                <span>Surface Temp</span>
                <strong>
                  {activeStarSelection.item.star.teffK?.toLocaleString() ?? '—'} K
                </strong>
              </div>
              <div className="tooltip-metric">
                <span>Luminosity</span>
                <strong>
                  {inspectedDetails.luminositySolar !== null
                    ? inspectedDetails.luminositySolar >= 10
                      ? `${inspectedDetails.luminositySolar.toFixed(0)} L☉`
                      : `${inspectedDetails.luminositySolar.toFixed(3)} L☉`
                    : '—'}
                </strong>
              </div>
              <div className="tooltip-metric">
                <span>Est. Radius</span>
                <strong>
                  {inspectedDetails.radiusSolar !== null
                    ? `${inspectedDetails.radiusSolar.toFixed(2)} R☉`
                    : '—'}
                </strong>
              </div>
              <div className="tooltip-metric">
                <span>Distance</span>
                <strong>
                  {activeStarSelection.item.star.distancePc?.toFixed(1)} pc (
                  {activeStarSelection.item.star.distanceLy?.toFixed(0)} ly)
                </strong>
              </div>
              <div className="tooltip-metric">
                <span>Color (BP − RP)</span>
                <strong>{activeStarSelection.item.star.bpRp?.toFixed(3)} mag</strong>
              </div>
              <div className="tooltip-metric">
                <span>Parallax (ϖ)</span>
                <strong>{activeStarSelection.item.star.parallaxMas?.toFixed(2)} mas</strong>
              </div>
              <div className="tooltip-metric">
                <span>Sky (RA / Dec)</span>
                <strong>
                  {formatHms(activeStarSelection.item.star.ra, 0)}{' '}
                  {formatDms(activeStarSelection.item.star.dec, 0)}
                </strong>
              </div>
            </div>

            <div className="tooltip-links">
              <a
                href={inspectedUrls.esaSkyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link"
              >
                <svg className="ext-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                  <ellipse cx="8" cy="8" rx="6" ry="2.4" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 2v12" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>ESASky</span>
                <svg className="ext-arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href={inspectedUrls.vizierGaiaDr3Url}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link"
              >
                <svg className="ext-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="11" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2.5 6.2h11M6.2 6.2v7.3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>Gaia DR3</span>
                <svg className="ext-arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href={inspectedUrls.simbadConeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link"
              >
                <svg className="ext-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span>SIMBAD</span>
                <svg className="ext-arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <div className="tooltip-hint">
              {pinned ? 'Pinned — click empty canvas to close' : 'Click star to pin & open links'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams, useSearch } from 'wouter';
import { formatDms, formatHms } from '@skyscout/core';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  COLOR_SCHEMES,
  type ColorSchemeId,
  computeConstantRadiusCurve,
  computeStarCanvasRadius,
  type CustomConeTarget,
  downloadGalleryPoster,
  fetchCustomConeStars,
  fetchTargetStars,
  findClosestStarAtPoint,
  generateClusterFallbackStars,
  generateClusterPreviewPoints,
  getCachedTargetStars,
  getGaiaStarExternalUrls,
  getStarPhysicalDetails,
  HR_BOUNDS,
  type HrBounds,
  panHrBounds,
  type PlotBox,
  RADIUS_LINES_SOLAR,
  renderGalleryPosterCanvas,
  searchCatalogPresets,
  starToCanvasXY,
  TARGET_PRESETS,
  type TargetCategory,
  type TargetPreset,
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
  diagramTitle?: string;
  diagramMeta?: string;
  showRadiusLines?: boolean;
  hoveredStar?: GaiaStar | null;
  posterHeader?: {
    title: string;
    subtitle: string;
  };
}) {
  const {
    ctx,
    width,
    height,
    box,
    bounds,
    schemeId,
    stars,
    diagramTitle,
    diagramMeta,
    showRadiusLines = false,
    hoveredStar,
    posterHeader,
  } = options;
  const scheme = COLOR_SCHEMES[schemeId];
  const scale = posterHeader ? 2.2 : 1;
  const isLightTheme = schemeId === 'print-light';

  // 1. Pitch-black (or scheme) background
  ctx.fillStyle = scheme.canvasBg;
  ctx.fillRect(0, 0, width, height);

  // Optional Poster Title Header & Footer
  if (posterHeader) {
    ctx.fillStyle = scheme.titleTextColor;
    ctx.font = `700 ${Math.round(26 * scale)}px "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(posterHeader.title, box.left, Math.round(44 * scale));

    ctx.fillStyle = scheme.axisTextColor;
    ctx.font = `400 ${Math.round(12.5 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillText(posterHeader.subtitle, box.left, Math.round(68 * scale));

    ctx.textAlign = 'right';
    ctx.fillText(
      `${stars.length.toLocaleString()} Stars · ESA Gaia DR3 · SkyScout StarPlot`,
      box.left + box.width,
      Math.round(68 * scale)
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

  // Optional Constant Stellar Radius Overlay Lines (0.01 R☉ to 1000 R☉)
  if (showRadiusLines) {
    ctx.save();
    ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.22)' : 'rgba(148, 163, 184, 0.25)';
    ctx.fillStyle = isLightTheme ? 'rgba(15, 23, 42, 0.55)' : 'rgba(148, 163, 184, 0.65)';
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.font = `${Math.round(9.5 * scale)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';

    for (const rSolar of RADIUS_LINES_SOLAR) {
      const curve = computeConstantRadiusCurve(rSolar, 42);
      ctx.beginPath();
      curve.forEach((pt, idx) => {
        const { x, y } = starToCanvasXY(pt.bpRp, pt.absoluteMagG, box, bounds);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Label near the middle-left of each constant-radius curve
      const labelAnchor = curve[6];
      if (labelAnchor) {
        const pos = starToCanvasXY(labelAnchor.bpRp, labelAnchor.absoluteMagG, box, bounds);
        ctx.fillText(`${rSolar} R☉`, pos.x + 4 * scale, pos.y - 4 * scale);
      }
    }
    ctx.restore();
  }

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

  // Target star cluster name & metadata watermark in upper-right corner of diagram
  if (diagramTitle) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = isLightTheme ? '#0f172a' : '#f8fafc';
    ctx.globalAlpha = 0.9;
    ctx.font = `600 ${Math.round(13.5 * scale)}px "Inter", sans-serif`;
    ctx.fillText(diagramTitle, box.left + box.width - 14 * scale, box.top + 24 * scale);

    if (diagramMeta) {
      ctx.fillStyle = scheme.axisTextColor;
      ctx.globalAlpha = 0.8;
      ctx.font = `400 ${Math.round(10.5 * scale)}px "JetBrains Mono", monospace`;
      ctx.fillText(diagramMeta, box.left + box.width - 14 * scale, box.top + 41 * scale);
    }
    ctx.restore();
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

/**
 * Renders a fast, zero-network mini H–R diagram thumbnail card on the `/` Home Page Grid.
 * Uses real cached Gaia DR3 stars from `localStorage` if already fetched, or deterministic
 * cluster preview points (`generateClusterPreviewPoints`) so all 32 cards render in 0ms.
 */
function ClusterGridCard({
  preset,
  onExport,
  isExporting = false,
}: {
  preset: TargetPreset;
  onExport?: (preset: TargetPreset) => void;
  isExporting?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cachedStars = useMemo(() => getCachedTargetStars(preset.id, 1000), [preset.id]);

  const points = useMemo(() => {
    if (cachedStars && cachedStars.length > 0) {
      return cachedStars
        .filter((s) => s.bpRp !== null && s.absoluteMagG !== null)
        .map((s) => ({ bpRp: s.bpRp!, absoluteMagG: s.absoluteMagG! }));
    }
    return generateClusterPreviewPoints(preset);
  }, [cachedStars, preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = 280;
    const height = 152;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const box: PlotBox = { left: 10, top: 10, width: width - 20, height: height - 20 };

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const pt of points) {
      const { x, y } = starToCanvasXY(pt.bpRp, pt.absoluteMagG, box, HR_BOUNDS);
      if (x < box.left || x > box.left + box.width || y < box.top || y > box.top + box.height) {
        continue;
      }
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = bpRpToStarHexColor(pt.bpRp, 'blackbody');
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(box.left, box.top, box.width, box.height);
  }, [points]);

  return (
    <Link href={`/chart/${preset.id}`} className="cluster-card">
      <div className="cluster-card-top">
        <div className="cluster-card-badges">
          <span className="catalog-code-badge">{preset.catalogCode ?? preset.shortName}</span>
          <span className={`category-pill ${preset.category.toLowerCase().replace(' ', '-')}`}>
            {preset.category}
          </span>
        </div>
        {onExport && (
          <button
            type="button"
            className="card-quick-poster-btn"
            disabled={isExporting}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onExport(preset);
            }}
            title={`Export 18×24" 300 DPI Fine-Art Poster for ${preset.label}`}
          >
            {isExporting ? '⏳' : '🖼️ 18×24"'}
          </button>
        )}
      </div>

      <div className="cluster-thumb-wrap">
        <canvas ref={canvasRef} className="cluster-thumb-canvas" />
        <span className="thumb-age-badge">{preset.age}</span>
      </div>

      <div className="cluster-card-body">
        <h3 className="cluster-card-title">{preset.label}</h3>
        <div className="cluster-card-meta">
          <span>{preset.constellation ?? 'All-Sky'}</span>
          <span>•</span>
          <span>
            {preset.distancePcApprox >= 1000
              ? `~${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
              : `~${preset.distancePcApprox} pc`}
          </span>
          {preset.cone && (
            <>
              <span>•</span>
              <span>
                {formatHms(preset.cone.ra, 0)} {formatDms(preset.cone.dec, 0)}
              </span>
            </>
          )}
        </div>
        <p className="cluster-card-subtitle">{preset.subtitle}</p>
      </div>

      <div className="cluster-card-footer">
        <span>Open Interactive H–R Diagram</span>
        <span className="arrow-right">→</span>
      </div>
    </Link>
  );
}

const HERO_PRESET_IDS: TargetPresetId[] = [
  'pleiades',
  'm13',
  'hyades',
  'double-cluster',
  'solar-50pc',
];

/**
 * `/` Home Page: Grid display of all 32 Messier, NGC & Caldwell star clusters + Custom Sky Cone Search.
 */
function HomeCatalogView() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<TargetCategory | 'All'>('All');
  const [showCustomCone, setShowCustomCone] = useState<boolean>(false);
  const [exportTheme, setExportTheme] = useState<ColorSchemeId>('blackbody');
  const [exportingTargetId, setExportingTargetId] = useState<string | null>(null);
  const [exportingBatch, setExportingBatch] = useState<boolean>(false);

  const handleExportSingle = async (preset: TargetPreset) => {
    if (exportingTargetId || exportingBatch) return;
    setExportingTargetId(preset.id);
    try {
      await downloadGalleryPoster(preset, exportTheme);
    } finally {
      setExportingTargetId(null);
    }
  };

  const handleBatchExportTop5 = async () => {
    if (exportingBatch) return;
    setExportingBatch(true);
    try {
      for (const id of HERO_PRESET_IDS) {
        const p = TARGET_PRESETS.find((x) => x.id === id);
        if (p) {
          setExportingTargetId(p.id);
          await downloadGalleryPoster(p, exportTheme);
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    } finally {
      setExportingTargetId(null);
      setExportingBatch(false);
    }
  };

  // Custom Cone Search Form State (defaults to NGC 752 in Andromeda as a ready-to-run example)
  const [customName, setCustomName] = useState<string>('NGC 752');
  const [customRa, setCustomRa] = useState<string>('29.421');
  const [customDec, setCustomDec] = useState<string>('37.785');
  const [customRadius, setCustomRadius] = useState<string>('0.65');
  const [customMinDist, setCustomMinDist] = useState<string>('380');
  const [customMaxDist, setCustomMaxDist] = useState<string>('520');

  const filteredPresets = useMemo(
    () => searchCatalogPresets(searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const counts = useMemo(() => {
    return {
      All: TARGET_PRESETS.length,
      'Open Cluster': TARGET_PRESETS.filter((p) => p.category === 'Open Cluster').length,
      'Globular Cluster': TARGET_PRESETS.filter((p) => p.category === 'Globular Cluster').length,
      'Solar Volume': TARGET_PRESETS.filter((p) => p.category === 'Solar Volume').length,
    };
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      name: customName.trim() || 'Custom Sky Field',
      ra: customRa,
      dec: customDec,
      radius: customRadius,
      minDist: customMinDist,
      maxDist: customMaxDist,
    });
    setLocation(`/chart/custom?${params.toString()}`);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="title-group">
          <h1>
            ✨ StarPlot <span className="badge">ESA Gaia DR3 Live</span>
          </h1>
          <p className="subtitle">
            Explore {TARGET_PRESETS.length} Messier, NGC &amp; Caldwell Star Clusters across Stellar
            Evolution
          </p>
        </div>

        <div className="toolbar-actions">
          <Link href="/gallery" className="action-btn">
            🖼️ Poster Gallery
          </Link>
          <button
            type="button"
            className={`action-btn ${showCustomCone ? 'primary' : ''}`}
            onClick={() => setShowCustomCone((v) => !v)}
          >
            🔭 Custom Sky Cone Search
          </button>
          <Link href="/chart/solar-50pc" className="action-btn primary">
            📈 Open Multi-Cluster Chart →
          </Link>
        </div>
      </header>

      {showCustomCone && (
        <form className="custom-cone-panel" onSubmit={handleCustomSubmit}>
          <div className="custom-cone-header">
            <strong>🔭 Custom Gaia DR3 Sky Cone Search</strong>
            <span>Query any NGC / IC / Messier cluster or Milky Way coordinate field</span>
          </div>
          <div className="custom-cone-fields">
            <label>
              <span>Target Label</span>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. NGC 752"
                required
              />
            </label>
            <label>
              <span>RA (° ICRS)</span>
              <input
                type="number"
                step="any"
                min="0"
                max="360"
                value={customRa}
                onChange={(e) => setCustomRa(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Dec (° ICRS)</span>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={customDec}
                onChange={(e) => setCustomDec(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Radius (°)</span>
              <input
                type="number"
                step="any"
                min="0.05"
                max="10"
                value={customRadius}
                onChange={(e) => setCustomRadius(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Min Dist (pc)</span>
              <input
                type="number"
                step="any"
                min="1"
                value={customMinDist}
                onChange={(e) => setCustomMinDist(e.target.value)}
              />
            </label>
            <label>
              <span>Max Dist (pc)</span>
              <input
                type="number"
                step="any"
                min="1"
                value={customMaxDist}
                onChange={(e) => setCustomMaxDist(e.target.value)}
              />
            </label>
            <button type="submit" className="action-btn primary">
              Plot Region →
            </button>
          </div>
        </form>
      )}

      <div className="hero-poster-suite">
        <div className="hero-suite-header">
          <div>
            <h2 className="hero-suite-title">🖼️ Print-Ready Poster Collection (18×24" · 300 DPI)</h2>
            <p className="hero-suite-desc">
              High-resolution museum editions generated directly from ESA Gaia DR3 astrometry.
            </p>
          </div>
          <div className="hero-suite-controls">
            <Link href="/gallery" className="action-btn">
              🖼️ Interactive Gallery
            </Link>
            <select
              value={exportTheme}
              onChange={(e) => setExportTheme(e.target.value as ColorSchemeId)}
              className="select-control hero-theme-select"
            >
              <option value="blackbody">🌑 Classic Black (Wikipedia/Powell)</option>
              <option value="print-light">📜 Archival Cream (Light Paper)</option>
              <option value="gold">✨ JWST Infrared Gold</option>
              <option value="ultraviolet">🔮 Cosmic Ultraviolet</option>
            </select>
            <button
              type="button"
              className="action-btn primary"
              onClick={handleBatchExportTop5}
              disabled={exportingBatch || exportingTargetId !== null}
              title="Download all 5 bestseller posters sequentially"
            >
              {exportingBatch ? '⏳ Exporting Suite...' : '⚡ Download Top 5 Bestsellers'}
            </button>
          </div>
        </div>

        <div className="hero-poster-pills">
          {HERO_PRESET_IDS.map((id) => {
            const p = TARGET_PRESETS.find((x) => x.id === id);
            if (!p) return null;
            const isItemExporting = exportingTargetId === id;
            return (
              <button
                key={id}
                type="button"
                className="hero-poster-pill"
                disabled={isItemExporting || exportingBatch}
                onClick={() => handleExportSingle(p)}
                title={`Export 18×24" 300 DPI fine-art poster for ${p.label}`}
              >
                <span>{isItemExporting ? '⏳' : '📥'}</span>
                <strong>{p.id === 'solar-50pc' ? 'Solar (<50 pc)' : (p.catalogCode ?? p.shortName)}</strong>
                <span className="pill-sub">{p.id === 'solar-50pc' ? 'Local Bubble' : p.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="home-filter-bar">
        <div className="category-tabs">
          {(['All', 'Open Cluster', 'Globular Cluster', 'Solar Volume'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`preset-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' ? 'All Clusters' : `${cat}s`} ({counts[cat]})
            </button>
          ))}
        </div>

        <input
          type="search"
          className="cluster-search-input"
          placeholder="Search Messier (M45, M13, M67), NGC, name, or constellation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPresets.length === 0 ? (
        <div className="empty-grid-state">
          <p>No curated clusters matched &ldquo;{searchQuery}&rdquo;.</p>
          <button
            type="button"
            className="action-btn primary"
            onClick={() => setShowCustomCone(true)}
          >
            🔭 Query Custom Coordinates on ESA Gaia DR3
          </button>
        </div>
      ) : (
        <div className="cluster-grid">
          {filteredPresets.map((preset) => (
            <ClusterGridCard
              key={preset.id}
              preset={preset}
              onExport={handleExportSingle}
              isExporting={exportingTargetId === preset.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * `/chart/:id` Interactive H–R Diagram View:
 * Plots the selected `:id` cluster (or custom cone query) and allows layering additional clusters,
 * toggling Famous Benchmark Stars, and toggling Constant Stellar Radius (`R☉`) lines.
 */
function ChartView() {
  const params = useParams<{ id: string }>();
  const searchString = useSearch();
  const routeId = params.id ?? 'solar-50pc';

  const client = useMemo(() => {
    const endpoint = import.meta.env.VITE_GAIA_ENDPOINT || '/gaia-tap';
    return new GaiaClient({ endpoint });
  }, []);

  const customTarget = useMemo<CustomConeTarget | null>(() => {
    if (routeId !== 'custom') return null;
    const sp = new URLSearchParams(searchString);
    const ra = Number(sp.get('ra') ?? 56.75);
    const dec = Number(sp.get('dec') ?? 24.12);
    const radiusDeg = Number(sp.get('radius') ?? 0.6);
    const minDist = Number(sp.get('minDist') ?? 0);
    const maxDist = Number(sp.get('maxDist') ?? 0);
    return {
      name: sp.get('name') || 'Custom Field',
      ra: Number.isFinite(ra) ? ra : 56.75,
      dec: Number.isFinite(dec) ? dec : 24.12,
      radiusDeg: Number.isFinite(radiusDeg) ? radiusDeg : 0.6,
      minDistancePc: minDist > 0 ? minDist : undefined,
      maxDistancePc: maxDist > 0 ? maxDist : undefined,
    };
  }, [routeId, searchString]);

  const initialPresetId = useMemo<TargetPresetId[]>(() => {
    if (routeId === 'custom') return [];
    const found = TARGET_PRESETS.find((p) => p.id === routeId);
    return found ? [found.id] : ['solar-50pc'];
  }, [routeId]);

  const [selectedTargets, setSelectedTargets] = useState<TargetPresetId[]>(initialPresetId);
  const [schemeId, setSchemeId] = useState<ColorSchemeId>('blackbody');
  const [showRadiusLines, setShowRadiusLines] = useState<boolean>(false);
  const [bounds, setBounds] = useState<HrBounds>(HR_BOUNDS);
  const [taggedStars, setTaggedStars] = useState<TaggedStar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const handleRetry = useCallback(() => {
    setError(null);
    setFallbackNotice(null);
    setRetryKey((k) => k + 1);
  }, []);

  // Sync selectedTargets when navigating to a new `/chart/:id` route
  useEffect(() => {
    setSelectedTargets(initialPresetId);
    setBounds(HR_BOUNDS);
  }, [initialPresetId]);

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
    if (selectedTargets.length === 0 && !customTarget) {
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

    const tasks: Array<
      Promise<{
        sourceLabel: string;
        list: GaiaStar[];
        isFallback?: boolean;
        error?: string;
      }>
    > = selectedTargets.map(async (id) => {
      const preset = TARGET_PRESETS.find((p) => p.id === id);
      try {
        const list = await fetchTargetStars(client, id, 1000);
        return { sourceLabel: preset?.shortName ?? id, list, isFallback: false };
      } catch (err) {
        if (preset) {
          const fallbackList = generateClusterFallbackStars(preset);
          return {
            sourceLabel: preset.shortName,
            list: fallbackList,
            isFallback: true,
            error: (err as Error).message,
          };
        }
        throw err;
      }
    });

    if (customTarget) {
      tasks.unshift(
        fetchCustomConeStars(client, customTarget, 1000).then((list) => ({
          sourceLabel: customTarget.name,
          list,
          isFallback: false,
        }))
      );
    }

    Promise.all(tasks)
      .then((results) => {
        if (cancelled) return;
        const uniqueMap = new Map<string, TaggedStar>();
        const fallbackSources: string[] = [];
        let sampleError: string | null = null;

        for (const { sourceLabel, list, isFallback, error: errStr } of results) {
          if (isFallback) {
            fallbackSources.push(sourceLabel);
            if (errStr && !sampleError) sampleError = errStr;
          }
          for (const star of list) {
            uniqueMap.set(star.sourceId, { star, sourceLabel });
          }
        }
        setTaggedStars(Array.from(uniqueMap.values()));
        setElapsedMs(Math.round(performance.now() - t0));

        if (fallbackSources.length > 0) {
          const isOverloaded = sampleError?.includes('overloaded') || sampleError?.includes('503');
          const noticeHeader = isOverloaded
            ? 'ESA Gaia TAP server is temporarily overloaded (503)'
            : 'ESA Gaia TAP network service temporarily unreachable';
          setFallbackNotice(
            `${noticeHeader}. Displaying high-precision offline reference stars for ${fallbackSources.join(', ')} so you can continue exploring and generating fine-art posters.`
          );
        } else {
          setFallbackNotice(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const rawMsg = (err as Error).message || 'Failed to query ESA Gaia TAP.';
        const cleanMsg = rawMsg
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        setError(cleanMsg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, customTarget, retryKey, selectedTargets]);

  const activeStarSelection = pinned ?? hovered;

  const activePresets = useMemo(
    () => TARGET_PRESETS.filter((p) => selectedTargets.includes(p.id)),
    [selectedTargets]
  );

  const activeTitle = useMemo(() => {
    const names = [
      ...(customTarget ? [`${customTarget.name} (Custom Cone)`] : []),
      ...activePresets.map((p) => p.label),
    ];
    return names.length > 0
      ? names.join('  +  ')
      : 'No sources selected — click any cluster below to plot';
  }, [activePresets, customTarget]);

  const diagramMeta = useMemo(() => {
    if (activePresets.length === 1 && !customTarget) {
      const p = activePresets[0];
      const distStr =
        p.distancePcApprox >= 1000
          ? `~${(p.distancePcApprox / 1000).toFixed(1)} kpc`
          : `~${p.distancePcApprox} pc`;
      return `${p.category} · ${p.age} · ${distStr}`;
    }
    if (customTarget && activePresets.length === 0) {
      return `RA ${customTarget.ra.toFixed(2)}°  Dec ${customTarget.dec.toFixed(2)}°  r=${customTarget.radiusDeg}°`;
    }
    if (activePresets.length > 1) {
      return `${activePresets.length} Clusters Combined · ${taggedStars.length.toLocaleString()} Stars`;
    }
    return '';
  }, [activePresets, customTarget, taggedStars.length]);

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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const box: PlotBox = {
      left: PADDING.left,
      top: PADDING.top,
      width: rect.width - PADDING.left - PADDING.right,
      height: rect.height - PADDING.top - PADDING.bottom,
    };

    renderHrDiagramCanvas({
      ctx,
      width: rect.width,
      height: rect.height,
      box,
      bounds,
      schemeId,
      stars: taggedStars,
      diagramTitle: selectedTargets.length > 0 || customTarget ? activeTitle : undefined,
      diagramMeta: diagramMeta || undefined,
      showRadiusLines,
      hoveredStar: activeStarSelection?.item.star ?? null,
    });
  }, [
    activeStarSelection,
    activeTitle,
    bounds,
    customTarget,
    diagramMeta,
    schemeId,
    selectedTargets.length,
    showRadiusLines,
    taggedStars,
  ]);

  // Mouse wheel zoom centered at cursor position
  // Attach non-passive wheel listener for smooth zoom around cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const box: PlotBox = {
        left: PADDING.left,
        top: PADDING.top,
        width: rect.width - PADDING.left - PADDING.right,
        height: rect.height - PADDING.top - PADDING.bottom,
      };
      const anchorX = Math.max(0, Math.min(1, (e.clientX - rect.left - box.left) / box.width));
      const anchorY = Math.max(0, Math.min(1, (e.clientY - rect.top - box.top) / box.height));
      const scaleFactor = e.deltaY < 0 ? 0.84 : 1.19;

      setBounds((prev) => zoomHrBounds(prev, scaleFactor, anchorX, anchorY));
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

  const [exportingPoster, setExportingPoster] = useState(false);

  // Export 18" × 24" at 300 DPI Gallery Poster (5400 × 7200 px PNG) for Etsy / fine-art printing
  const handleExportPoster = useCallback(() => {
    if (exportingPoster) return;
    setExportingPoster(true);

    // Timeout allows the UI button to show the loading state immediately
    setTimeout(() => {
      try {
        const width = 5400; // 18" at 300 DPI
        const height = 7200; // 24" at 300 DPI
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) {
          setExportingPoster(false);
          return;
        }

        renderGalleryPosterCanvas({
          ctx,
          width,
          height,
          bounds,
          schemeId,
          stars: taggedStars,
          showRadiusLines,
          primaryPreset: activePresets[0] ?? null,
          customTarget,
          additionalPresets: activePresets.slice(1),
        });

        offscreen.toBlob((blob) => {
          if (!blob) {
            setExportingPoster(false);
            return;
          }
          const dataUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = dataUrl;
          const slug =
            selectedTargets.slice(0, 3).join('-') ||
            customTarget?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
            'custom';
          link.download = `starplot-18x24-poster-${slug}-${schemeId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(dataUrl), 10000);
          setExportingPoster(false);
        }, 'image/png');
      } catch (err) {
        console.error('Failed to export gallery poster:', err);
        setExportingPoster(false);
      }
    }, 40);
  }, [
    activePresets,
    bounds,
    customTarget,
    exportingPoster,
    schemeId,
    selectedTargets,
    showRadiusLines,
    taggedStars,
  ]);

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
          <div className="breadcrumb-row">
            <Link href="/" className="back-grid-link">
              ← All Clusters Grid ({TARGET_PRESETS.length})
            </Link>
            <span className="badge">ESA Gaia DR3 Live</span>
          </div>
          <h1>{activeTitle}</h1>
        </div>

        <div className="toolbar-actions">
          <Link href="/gallery" className="action-btn">
            🖼️ Poster Gallery
          </Link>
          <button
            type="button"
            className={`action-btn ${showRadiusLines ? 'primary' : ''}`}
            onClick={() => setShowRadiusLines((v) => !v)}
            title="Overlay constant stellar radius lines (0.01 R☉ to 1000 R☉)"
          >
            📏 Radius Lines (R☉)
          </button>

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
            disabled={exportingPoster || taggedStars.length === 0}
            className="action-btn primary"
            title="Export 18×24 inch museum fine-art poster at 300 DPI (5400×7200 px) for Etsy printing"
          >
            {exportingPoster ? '⏳ Rendering 18×24" Poster...' : '🖼️ Export 18×24" Poster (300 DPI)'}
          </button>
        </div>
      </header>

      <div className="catalog-panel">
        <div className="catalog-header">
          <span className="catalog-title">
            Layer &amp; Compare Sources ({selectedTargets.length} of {TARGET_PRESETS.length} active)
          </span>
          <div className="bulk-actions">
            <button
              type="button"
              className="bulk-btn"
              onClick={() => setSelectedTargets(TARGET_PRESETS.map((p) => p.id))}
              disabled={selectedTargets.length === TARGET_PRESETS.length}
            >
              ✓ Select All
            </button>
            <button
              type="button"
              className="bulk-btn"
              onClick={() => {
                setSelectedTargets([]);
                setHovered(null);
                setPinned(null);
              }}
              disabled={selectedTargets.length === 0}
            >
              ✕ Select None
            </button>
          </div>
        </div>
        {categories.map((category) => (
          <div key={category} className="category-row">
            <span className="category-label">{category}:</span>
            <div className="preset-list">
              {TARGET_PRESETS.filter((p) => p.category === category).map((preset) => {
                const isSelected = selectedTargets.includes(preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-btn ${isSelected ? 'active' : ''}`}
                    onClick={() =>
                      setSelectedTargets((prev) => toggleTargetSelection(prev, preset.id))
                    }
                    title={`${preset.label} — ${preset.subtitle} (click to ${
                      isSelected ? 'remove' : 'add'
                    })`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {preset.shortName}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="status-bar">
        <div>
          {loading ? (
            <span>Querying ESA Gaia Archive TAP (with localStorage cache)...</span>
          ) : selectedTargets.length === 0 && !customTarget ? (
            <span>0 stars plotted · Select one or more clusters above</span>
          ) : (
            <span>
              Plotted <strong>{taggedStars.length.toLocaleString()}</strong> stars across{' '}
              <strong>{selectedTargets.length + (customTarget ? 1 : 0)}</strong> source
              {selectedTargets.length + (customTarget ? 1 : 0) > 1 ? 's' : ''}
              {elapsedMs !== null ? ` (${elapsedMs} ms)` : ''}
            </span>
          )}
        </div>

        <div className="zoom-controls">
          <span>Scroll to Zoom · Drag to Pan · Click Star to Pin</span>
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

      {fallbackNotice && (
        <div className="warning-banner">
          <div className="warning-content">
            <span>⚠️ <strong>ESA Gaia Service Notice:</strong> {fallbackNotice}</span>
          </div>
          <button
            type="button"
            className="banner-action-btn"
            onClick={handleRetry}
            title="Retry live query to ESA Gaia TAP server"
          >
            🔄 Retry Live Query
          </button>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}>
            <span>⚠️ {error}</span>
            <button
              type="button"
              className="banner-action-btn"
              onClick={handleRetry}
              title="Retry query"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}

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

        {!loading && selectedTargets.length === 0 && !customTarget && (
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
                  <path
                    d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href={inspectedUrls.vizierGaiaDr3Url}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link"
              >
                <svg className="ext-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect
                    x="2.5"
                    y="2.5"
                    width="11"
                    height="11"
                    rx="1.8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path d="M2.5 6.2h11M6.2 6.2v7.3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>Gaia DR3</span>
                <svg className="ext-arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                  <path
                    d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <span>SIMBAD</span>
                <svg className="ext-arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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

/**
 * `/gallery`: Dedicated Fine-Art Museum Poster Gallery & Mockup Room.
 * Features live 3:4 canvas rendering, oak/black/white frame mockups,
 * theme and finish selector, and 18x24" 300 DPI master exports.
 */
function PosterGalleryView() {
  const searchString = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const initialTarget = searchParams.get('target') as TargetPresetId | null;

  const client = useMemo(() => new GaiaClient(), []);
  const [selectedId, setSelectedId] = useState<TargetPresetId>(
    initialTarget && TARGET_PRESETS.some((p) => p.id === initialTarget)
      ? initialTarget
      : 'pleiades'
  );
  const [schemeId, setSchemeId] = useState<ColorSchemeId>('blackbody');
  const [showRadiusLines, setShowRadiusLines] = useState<boolean>(true);
  const [frameMockup, setFrameMockup] = useState<boolean>(true);
  const [frameStyle, setFrameStyle] = useState<'oak' | 'black' | 'white'>('oak');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [stars, setStars] = useState<GaiaStar[]>([]);
  const [isLoadingStars, setIsLoadingStars] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedPreset = useMemo(
    () => TARGET_PRESETS.find((p) => p.id === selectedId) || TARGET_PRESETS[0],
    [selectedId]
  );

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedTargetStars(selectedPreset.id, 1000);
    if (cached && cached.length > 0) {
      setStars(cached);
      return;
    }

    // Set immediate synthesized fallback stars so preview is instant
    setStars(generateClusterFallbackStars(selectedPreset));
    setIsLoadingStars(true);

    fetchTargetStars(client, selectedPreset.id, 1000)
      .then((liveStars) => {
        if (!cancelled && liveStars && liveStars.length > 0) {
          setStars(liveStars);
        }
      })
      .catch((err) => {
        console.warn('Live Gaia fetch failed for gallery, using fallback stars:', err);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingStars(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, selectedPreset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use 1800 x 2400 (3:4 ratio, 1/3 scale of 5400x7200) for sharp retina preview
    canvas.width = 1800;
    canvas.height = 2400;

    const scale = 1800 / 5400;
    ctx.save();
    ctx.scale(scale, scale);

    const starList = stars.length > 0 ? stars : generateClusterFallbackStars(selectedPreset);
    const tagged = starList.map((star) => ({
      star,
      sourceLabel: selectedPreset.shortName,
    }));

    renderGalleryPosterCanvas({
      ctx,
      width: 5400,
      height: 7200,
      bounds: HR_BOUNDS,
      schemeId,
      stars: tagged,
      showRadiusLines,
      primaryPreset: selectedPreset,
    });

    ctx.restore();
  }, [selectedPreset, schemeId, showRadiusLines, stars]);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await downloadGalleryPoster(selectedPreset, schemeId, { showRadiusLines });
    } catch (err) {
      console.error('Failed to export poster:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app gallery-app">
      <header className="header">
        <div className="title-group">
          <div className="breadcrumb-row">
            <Link href="/" className="back-grid-link">
              ← All Clusters Grid ({TARGET_PRESETS.length})
            </Link>
            <span className="badge">ESA Gaia DR3 Print Edition</span>
          </div>
          <h1>🖼️ Museum Poster Gallery</h1>
          <p className="subtitle">
            18×24" Fine-Art H–R Diagram Editions · 300 DPI Museum Print Ready for Etsy, Gelato &amp; Printify
          </p>
        </div>

        <div className="toolbar-actions">
          <Link href={`/chart/${selectedPreset.id}`} className="action-btn">
            📈 Interactive Star Explorer →
          </Link>
          <button
            type="button"
            className="action-btn primary"
            onClick={handleExport}
            disabled={isExporting}
            title="Download full 5400×7200 px PNG at 300 DPI for professional printing"
          >
            {isExporting ? '⏳ Rendering 300 DPI...' : '📥 Download 18×24" Poster (300 DPI)'}
          </button>
        </div>
      </header>

      <div className="gallery-layout">
        {/* Left: Wall Display & Framed Canvas */}
        <div className="gallery-stage">
          <div className={`gallery-wall ${frameMockup ? 'with-shadow' : ''}`}>
            <div
              className={`gallery-frame ${frameMockup ? `frame-${frameStyle}` : 'frame-bare'}`}
            >
              {frameMockup && <div className="gallery-mat-bevel" />}
              <div className="gallery-canvas-wrap">
                <canvas ref={canvasRef} className="gallery-canvas" />
                {frameMockup && <div className="gallery-glass-glare" />}
              </div>
            </div>
          </div>

          <div className="gallery-stage-caption">
            <strong>{selectedPreset.label}</strong>
            <span>•</span>
            <span>18 × 24 inches (45.7 × 61.0 cm)</span>
            <span>•</span>
            <span>5,400 × 7,200 px @ 300 DPI</span>
            {isLoadingStars && <span className="gallery-loading-pill">🛰️ Updating Gaia DR3...</span>}
          </div>
        </div>

        {/* Right: Controls & Specifications Sidebar */}
        <aside className="gallery-sidebar">
          {/* Target Cluster Section */}
          <div className="gallery-card">
            <h3 className="gallery-card-title">1. Select Target Cluster</h3>
            <div className="gallery-hero-pills">
              {HERO_PRESET_IDS.map((id) => {
                const p = TARGET_PRESETS.find((x) => x.id === id);
                if (!p) return null;
                const active = selectedId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`gallery-pill-btn ${active ? 'active' : ''}`}
                    onClick={() => setSelectedId(id)}
                  >
                    <strong>{p.catalogCode ?? p.shortName}</strong>
                    <span>{p.shortName}</span>
                  </button>
                );
              })}
            </div>

            <div className="gallery-dropdown-wrap">
              <label htmlFor="cluster-select" className="gallery-label">
                Or choose any of {TARGET_PRESETS.length} clusters:
              </label>
              <select
                id="cluster-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value as TargetPresetId)}
                className="select-control gallery-select"
              >
                <optgroup label="Hero Bestsellers">
                  {HERO_PRESET_IDS.map((id) => {
                    const p = TARGET_PRESETS.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <option key={p.id} value={p.id}>
                        ⭐ {p.label} ({p.age})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Open Star Clusters">
                  {TARGET_PRESETS.filter(
                    (p) => p.category === 'Open Cluster' && !HERO_PRESET_IDS.includes(p.id)
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.age})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Globular Clusters">
                  {TARGET_PRESETS.filter(
                    (p) => p.category === 'Globular Cluster' && !HERO_PRESET_IDS.includes(p.id)
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.age})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Theme & Finish Section */}
          <div className="gallery-card">
            <h3 className="gallery-card-title">2. Color Scheme &amp; Print Finish</h3>
            <div className="gallery-theme-grid">
              {[
                {
                  id: 'blackbody',
                  name: 'Classic Black',
                  desc: 'Wikipedia/Powell style on deep pitch black',
                  badge: '🌑 Bestseller',
                },
                {
                  id: 'print-light',
                  name: 'Archival Cream',
                  desc: 'Warm off-white archival museum cotton paper',
                  badge: '📜 Fine Art',
                },
                {
                  id: 'gold',
                  name: 'JWST Infrared',
                  desc: 'Warm deep gold palette inspired by Webb NIRCam',
                  badge: '✨ Infrared',
                },
                {
                  id: 'ultraviolet',
                  name: 'Cosmic UV',
                  desc: 'High-energy ultraviolet & violet-blue glow',
                  badge: '🔮 Deep Space',
                },
              ].map((theme) => {
                const active = schemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`gallery-theme-btn ${active ? 'active' : ''}`}
                    onClick={() => setSchemeId(theme.id as ColorSchemeId)}
                  >
                    <div className="theme-btn-top">
                      <span className="theme-btn-badge">{theme.badge}</span>
                      <strong>{theme.name}</strong>
                    </div>
                    <p className="theme-btn-desc">{theme.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frame Mockup & Overlays */}
          <div className="gallery-card">
            <h3 className="gallery-card-title">3. Display Mockup &amp; Overlays</h3>
            <div className="gallery-toggles-row">
              <label className="gallery-checkbox-label">
                <input
                  type="checkbox"
                  checked={frameMockup}
                  onChange={(e) => setFrameMockup(e.target.checked)}
                />
                <span>🖼️ Show Gallery Wall Frame</span>
              </label>

              <label className="gallery-checkbox-label">
                <input
                  type="checkbox"
                  checked={showRadiusLines}
                  onChange={(e) => setShowRadiusLines(e.target.checked)}
                />
                <span>📏 Solar Radius Curves (R☉)</span>
              </label>
            </div>

            {frameMockup && (
              <div className="gallery-frame-styles">
                <span className="gallery-label">Frame Material:</span>
                <div className="gallery-btn-group">
                  <button
                    type="button"
                    className={`gallery-btn-choice ${frameStyle === 'oak' ? 'active' : ''}`}
                    onClick={() => setFrameStyle('oak')}
                  >
                    🪵 Natural Oak
                  </button>
                  <button
                    type="button"
                    className={`gallery-btn-choice ${frameStyle === 'black' ? 'active' : ''}`}
                    onClick={() => setFrameStyle('black')}
                  >
                    🖤 Matte Black
                  </button>
                  <button
                    type="button"
                    className={`gallery-btn-choice ${frameStyle === 'white' ? 'active' : ''}`}
                    onClick={() => setFrameStyle('white')}
                  >
                    🤍 Gallery White
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Master Download Call to Action */}
          <div className="gallery-card highlight-card">
            <div className="cta-header">
              <div>
                <h3 className="cta-title">📥 Ready for Etsy &amp; Print on Demand</h3>
                <p className="cta-subtitle">
                  Outputs 18×24" @ 300 DPI (5,400 × 7,200 px lossless PNG) with zero border trim bleed.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="gallery-download-master-btn"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Rendering 38.8 MP Poster...' : '📥 Download 18×24" Master Poster (300 DPI)'}
            </button>

            <div className="specs-table">
              <div className="spec-row">
                <span className="spec-key">Dimensions</span>
                <span className="spec-val">18 × 24 inches (45.7 × 61.0 cm)</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Print Resolution</span>
                <span className="spec-val">5,400 × 7,200 px (300 DPI / 38.8 Megapixels)</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Color Profile</span>
                <span className="spec-val">sRGB · 8-bit Lossless PNG</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Print Compatibility</span>
                <span className="spec-val">Gelato, Printify, Prodigi, Giclée</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Recommended Stock</span>
                <span className="spec-val">200–250 gsm Heavyweight Museum Matte</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Attribution &amp; License</span>
                <span className="spec-val">ESA Gaia DR3 astrometric data · CC BY-SA compatible</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomeCatalogView} />
      <Route path="/gallery" component={PosterGalleryView} />
      <Route path="/chart/:id" component={ChartView} />
      <Route>
        <HomeCatalogView />
      </Route>
    </Switch>
  );
}

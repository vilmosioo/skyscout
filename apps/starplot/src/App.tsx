import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Switch, useParams } from 'wouter';
import { NasaClient } from '@skyscout/nasa-client';
import type { GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  downloadGalleryPoster,
  fetchNasaClusterStars,
  formatPosterTitle,
  generateClusterFallbackStars,
  generateClusterPreviewPoints,
  getCachedNasaStars,
  HR_BOUNDS,
  POSTER_THEMES,
  type PosterThemeId,
  renderFineArtPoster,
  TARGET_PRESETS,
  type TargetPreset,
} from './hrPlot';

/**
 * Cluster card rendered on the Home Page grid.
 * Displays an authentic 3:4 miniature fine-art poster preview tailored to the
 * currently selected poster theme and the cluster's unique sky coordinates & H–R isochrone.
 */
function ClusterCard({
  preset,
  themeId,
}: {
  preset: TargetPreset;
  themeId: PosterThemeId;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stars = useMemo(() => {
    return getCachedNasaStars(preset.id, 400) ?? generateClusterFallbackStars(preset);
  }, [preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard 3:4 aspect ratio matching 18×24" fine-art poster dimensions
    canvas.width = 360;
    canvas.height = 480;

    const theme = POSTER_THEMES[themeId];
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseRa = preset.cone?.ra ?? 56.75;
    const baseDec = preset.cone?.dec ?? 24.12;
    const radiusDeg = Math.max(0.2, preset.cone?.radiusDeg ?? 1.2);
    const cosDec = Math.max(0.1, Math.cos((baseDec * Math.PI) / 180));

    // Sample stars for clean, high-performance rendering (up to 160 stars)
    const step = Math.max(1, Math.floor(stars.length / 160));
    const sampleStars = stars.filter((_, idx) => idx % step === 0);

    if (themeId === 'two-maps') {
      // 🌌 Two Maps Thumbnail: Sky Disc above + H-R Box below + Connecting Bezier Strands
      const skyCenter = { x: 180, y: 125 };
      const skyR = 75;

      // Top title
      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.textAlign = 'center';
      ctx.fillText('THE SKY — WHERE THE STARS ARE', skyCenter.x, 28);

      // Sky Disc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(skyCenter.x, skyCenter.y, skyR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(skyCenter.x, skyCenter.y, skyR * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(skyCenter.x - 6, skyCenter.y);
      ctx.lineTo(skyCenter.x + 6, skyCenter.y);
      ctx.moveTo(skyCenter.x, skyCenter.y - 6);
      ctx.lineTo(skyCenter.x, skyCenter.y + 6);
      ctx.stroke();

      // Bottom Diagram Box
      const hrBox = { left: 40, top: 270, width: 280, height: 155 };
      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText('THE DIAGRAM — WHAT THE STARS ARE', skyCenter.x, 258);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.strokeRect(hrBox.left, hrBox.top, hrBox.width, hrBox.height);

      // Spectral Class labels O B A F G K M
      const spectralLabels = [
        { l: 'O', x: 0.05, c: '#60a5fa' },
        { l: 'B', x: 0.15, c: '#93c5fd' },
        { l: 'A', x: 0.28, c: '#f8fafc' },
        { l: 'F', x: 0.44, c: '#fef08a' },
        { l: 'G', x: 0.60, c: '#facc15' },
        { l: 'K', x: 0.77, c: '#fb923c' },
        { l: 'M', x: 0.94, c: '#ef4444' },
      ];
      ctx.font = '700 9px "Inter", sans-serif';
      spectralLabels.forEach((item) => {
        ctx.fillStyle = item.c;
        ctx.fillText(item.l, hrBox.left + item.x * hrBox.width, hrBox.top + hrBox.height + 15);
      });

      // Project stars and draw connecting strands
      const mapped = sampleStars.map((star) => {
        const bpRp = star.bpRp ?? 0.8;
        const absMag = star.absoluteMagG ?? 4.5;

        // True Sky Coordinates projection
        const dx = ((star.ra - baseRa) * cosDec) / radiusDeg;
        const dy = (star.dec - baseDec) / radiusDeg;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rClamped = dist <= 1 ? dist : 1 / (1 + (dist - 1) * 0.4);
        const angle = Math.atan2(dy, dx);
        const sx = skyCenter.x + Math.cos(angle) * rClamped * (skyR - 4);
        const sy = skyCenter.y - Math.sin(angle) * rClamped * (skyR - 4);

        // True H-R Coordinates projection
        const xNorm = Math.max(0, Math.min(1, (bpRp - HR_BOUNDS.minBpRp) / (HR_BOUNDS.maxBpRp - HR_BOUNDS.minBpRp)));
        const yNorm = Math.max(0, Math.min(1, (absMag - HR_BOUNDS.minAbsMag) / (HR_BOUNDS.maxAbsMag - HR_BOUNDS.minAbsMag)));
        const hx = hrBox.left + xNorm * hrBox.width;
        const hy = hrBox.top + yNorm * hrBox.height;

        const color = bpRpToStarHexColor(bpRp, 'blackbody');
        return { sx, sy, hx, hy, color, absMag };
      });

      // Connecting cubic Bezier strands
      ctx.lineWidth = 0.9;
      for (const pt of mapped) {
        ctx.strokeStyle = pt.color;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.moveTo(pt.sx, pt.sy);
        const cp1Y = pt.sy + (pt.hy - pt.sy) * 0.45;
        const cp2Y = pt.hy - (pt.hy - pt.sy) * 0.45;
        ctx.bezierCurveTo(pt.sx, cp1Y, pt.hx, cp2Y, pt.hx, pt.hy);
        ctx.stroke();
      }

      // Star dots
      for (const pt of mapped) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = pt.color;
        const r = pt.absMag < 0 ? 2.0 : pt.absMag < 3.5 ? 1.4 : 1.0;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pt.hx, pt.hy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      return;
    }

    if (themeId === 'star-quilt') {
      // 🧵 Star Quilt Thumbnail: Archival cream vintage aesthetic with stitched patchwork matrix
      // Vintage title
      ctx.font = '800 20px "Inter", sans-serif';
      ctx.fillStyle = '#1c1917';
      ctx.textAlign = 'left';
      ctx.fillText(preset.shortName, 32, 42);

      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#78716c';
      ctx.fillText('SEVEN FABRICS · ONE PER CLASS', 32, 58);

      // Quilt Grid
      const numCols = 12;
      const numRows = 14;
      const qBox = { left: 34, top: 78, width: 292, height: 320 };
      const cellW = qBox.width / numCols;
      const cellH = qBox.height / numRows;

      const densityMap = new Map<string, number>();
      for (const s of stars) {
        const bpRp = s.bpRp ?? 0.8;
        const absMag = s.absoluteMagG ?? 4.5;
        const c = Math.floor(((bpRp - HR_BOUNDS.minBpRp) / (HR_BOUNDS.maxBpRp - HR_BOUNDS.minBpRp)) * numCols);
        const r = Math.floor(((absMag - HR_BOUNDS.minAbsMag) / (HR_BOUNDS.maxAbsMag - HR_BOUNDS.minAbsMag)) * numRows);
        if (c >= 0 && c < numCols && r >= 0 && r < numRows) {
          const key = `${c},${r}`;
          densityMap.set(key, (densityMap.get(key) ?? 0) + 1);
        }
      }

      let maxDensity = 1;
      densityMap.forEach((count) => {
        if (count > maxDensity) maxDensity = count;
      });

      const fabricColors = [
        '#3b5998', // O: deep indigo
        '#5dade2', // B: sky blue
        '#85c1e9', // B/A: ice blue
        '#aed6f1', // A: pale ice
        '#d4e6f1', // A/F: soft frost
        '#fcf3cf', // F: warm cream
        '#f9e79f', // G: soft gold
        '#f5b041', // G: gold
        '#eb984e', // K: warm terracotta
        '#dc7633', // K: deep terracotta
        '#cb4335', // M: brick red
        '#b03a2e', // M: ruby red
      ];

      densityMap.forEach((count, key) => {
        const [cStr, rStr] = key.split(',');
        const c = parseInt(cStr, 10);
        const r = parseInt(rStr, 10);

        const x = qBox.left + c * cellW;
        const y = qBox.top + r * cellH;
        const w = cellW - 3;
        const h = cellH - 3;

        const color = fabricColors[Math.min(fabricColors.length - 1, c)];
        const alpha = Math.min(0.95, 0.35 + (count / maxDensity) * 0.6);

        // Fill patch
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, w, h, 2) : ctx.rect(x, y, w, h);
        ctx.fill();

        // Inset stitched dashed border
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
        ctx.setLineDash([]);
      });

      // Bottom Colorful Letters O B A F G K M
      const quiltSpectral = [
        { l: 'O', c: '#3b5998' },
        { l: 'B', c: '#5dade2' },
        { l: 'A', c: '#85c1e9' },
        { l: 'F', c: '#d4ac0d' },
        { l: 'G', c: '#f39c12' },
        { l: 'K', c: '#e67e22' },
        { l: 'M', c: '#c0392b' },
      ];
      ctx.globalAlpha = 1.0;
      ctx.font = '800 13px "Inter", sans-serif';
      ctx.textAlign = 'center';
      const specStep = qBox.width / quiltSpectral.length;
      quiltSpectral.forEach((item, idx) => {
        ctx.fillStyle = item.c;
        ctx.fillText(item.l, qBox.left + idx * specStep + specStep / 2, qBox.top + qBox.height + 26);
      });

      // Footer Cluster label
      ctx.font = '500 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#78716c';
      ctx.fillText(`${preset.shortName} · ${preset.age}`, 180, 452);
      return;
    }

    // 🌊 Night Fall / Cascade: Frameless cosmic cascade streaming from sky directly into diagram
    // Minimalist header
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText(preset.shortName, 32, 42);

    ctx.font = '500 8px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillText(`${preset.category.toUpperCase()} · ${preset.age}`, 32, 58);

    const skyCenter = { x: 180, y: 125 };
    const skyR = 75;
    const hrLeft = 40;
    const hrTop = 320;
    const hrW = 280;
    const hrH = 110;

    const mappedCascade = sampleStars.map((star) => {
      const bpRp = star.bpRp ?? 0.8;
      const absMag = star.absoluteMagG ?? 4.5;

      const dx = ((star.ra - baseRa) * cosDec) / radiusDeg;
      const dy = (star.dec - baseDec) / radiusDeg;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rClamped = dist <= 1 ? dist : 1 / (1 + (dist - 1) * 0.4);
      const angle = Math.atan2(dy, dx);
      const sx = skyCenter.x + Math.cos(angle) * rClamped * (skyR - 4);
      const sy = skyCenter.y - Math.sin(angle) * rClamped * (skyR - 4);

      const xNorm = Math.max(0, Math.min(1, (bpRp - HR_BOUNDS.minBpRp) / (HR_BOUNDS.maxBpRp - HR_BOUNDS.minBpRp)));
      const yNorm = Math.max(0, Math.min(1, (absMag - HR_BOUNDS.minAbsMag) / (HR_BOUNDS.maxAbsMag - HR_BOUNDS.minAbsMag)));
      const hx = hrLeft + xNorm * hrW;
      const hy = hrTop + yNorm * hrH;

      const color = bpRp < 0.3 ? '#93c5fd' : bpRp < 0.8 ? '#fef08a' : '#fed7aa';
      const lumNorm = Math.max(0, Math.min(1, (12 - absMag) / 16));
      return { sx, sy, hx, hy, color, lumNorm };
    });

    // Cascading luminous curves
    for (const pt of mappedCascade) {
      ctx.strokeStyle = pt.color;
      ctx.globalAlpha = 0.12 + pt.lumNorm * 0.25;
      ctx.lineWidth = 0.8 + pt.lumNorm * 1.4;
      ctx.beginPath();
      ctx.moveTo(pt.sx, pt.sy);
      const cp1Y = pt.sy + (pt.hy - pt.sy) * 0.42;
      const cp2Y = pt.hy - (pt.hy - pt.sy) * 0.42;
      ctx.bezierCurveTo(pt.sx, cp1Y, pt.hx, cp2Y, pt.hx, pt.hy);
      ctx.stroke();
    }

    // Star dots
    for (const pt of mappedCascade) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = pt.color;
      const dotR = 1.0 + pt.lumNorm * 2.2;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pt.hx, pt.hy, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }, [preset, stars, themeId]);

  const distStr =
    preset.distancePcApprox >= 1000
      ? `~${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
      : `~${preset.distancePcApprox} pc`;

  return (
    <Link href={`/cluster/${preset.id}?theme=${themeId}`} className="cluster-grid-card">
      <div className="card-thumb-wrap">
        <canvas ref={canvasRef} className="card-thumb-canvas" />
        <span className="card-age-tag">{preset.age}</span>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <h3 className="card-title">
            {preset.catalogCode ? `${preset.catalogCode} · ` : ''}
            {preset.shortName}
          </h3>
          <span className="card-category-badge">{preset.category}</span>
        </div>
        <p className="card-meta">
          <span>{preset.constellation ?? 'Milky Way'}</span>
          <span>•</span>
          <span>{distStr}</span>
        </p>
        <p className="card-desc">{preset.subtitle}</p>
      </div>

      <div className="card-footer">
        <span>View &amp; Download Poster</span>
        <span className="footer-arrow">→</span>
      </div>
    </Link>
  );
}

/**
 * `/`: Home Page Grid View of all star clusters.
 */
function HomeView() {
  const [activeTheme, setActiveTheme] = useState<PosterThemeId>('two-maps');

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="header-brand">
          <h1>
            ✨ StarPlot <span className="header-badge">NASA 2MASS Collection</span>
          </h1>
          <p className="header-subtitle">
            Fine-Art Astronomy Posters · 3 Distinct Museum Themes · {TARGET_PRESETS.length} Star Clusters
          </p>
        </div>

        <div className="home-theme-bar">
          <span className="theme-bar-label">Poster Theme:</span>
          <div className="theme-pills">
            {(Object.keys(POSTER_THEMES) as PosterThemeId[]).map((themeKey) => {
              const theme = POSTER_THEMES[themeKey];
              const active = activeTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  className={`theme-pill-btn ${active ? 'active' : ''}`}
                  onClick={() => setActiveTheme(themeKey)}
                >
                  <strong>{theme.badge}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="clusters-grid">
        {TARGET_PRESETS.map((preset) => (
          <ClusterCard key={preset.id} preset={preset} themeId={activeTheme} />
        ))}
      </main>
    </div>
  );
}

/**
 * `/cluster/:id`: Dedicated Star Cluster Poster View.
 * Displays full 3:4 canvas fine-art poster preview in the selected theme and 1-click 300 DPI 18×24" download.
 */
function ClusterPosterView() {
  const { id } = useParams<{ id: string }>();
  const preset = useMemo(() => {
    return TARGET_PRESETS.find((p) => p.id === id) || TARGET_PRESETS[0];
  }, [id]);

  const [activeTheme, setActiveTheme] = useState<PosterThemeId>('two-maps');
  const nasaClient = useMemo(() => new NasaClient(), []);
  const [stars, setStars] = useState<GaiaStar[]>(() => {
    return getCachedNasaStars(preset.id, 1000) ?? generateClusterFallbackStars(preset);
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedNasaStars(preset.id, 1000);
    if (cached && cached.length > 0) {
      setStars(cached);
      return;
    }

    setStars(generateClusterFallbackStars(preset));

    fetchNasaClusterStars(nasaClient, preset.id, 1000)
      .then((liveStars) => {
        if (!cancelled && liveStars && liveStars.length > 0) {
          setStars(liveStars);
        }
      })
      .catch((err) => {
        console.warn('NASA TAP fetch notice (using cached/synthesized stars):', err);
      });

    return () => {
      cancelled = true;
    };
  }, [nasaClient, preset]);

  // Render high-resolution preview to canvas (1800 × 2400 px, scaled down via CSS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1800;
    canvas.height = 2400;

    const scale = 1800 / 5400;
    ctx.save();
    ctx.scale(scale, scale);

    const starList = stars.length > 0 ? stars : generateClusterFallbackStars(preset);
    const tagged = starList.map((star) => ({
      star,
      sourceLabel: preset.shortName,
    }));

    renderFineArtPoster({
      ctx,
      width: 5400,
      height: 7200,
      bounds: HR_BOUNDS,
      themeId: activeTheme,
      stars: tagged,
      primaryPreset: preset,
    });

    ctx.restore();
  }, [activeTheme, preset, stars]);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await downloadGalleryPoster(preset, activeTheme);
    } catch (err) {
      console.error('Failed to export poster:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const distStr =
    preset.distancePcApprox >= 1000
      ? `~${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
      : `~${preset.distancePcApprox} pc`;

  const themeInfo = POSTER_THEMES[activeTheme];

  return (
    <div className="site-wrapper poster-page">
      <header className="poster-header">
        <div className="poster-header-left">
          <Link href="/" className="back-link">
            ← All Clusters Grid
          </Link>
          <h1 className="poster-title">{formatPosterTitle(preset)}</h1>
          <p className="poster-meta">
            <span>{preset.category}</span>
            <span>•</span>
            <span>{preset.constellation ?? 'Milky Way'}</span>
            <span>•</span>
            <span>{distStr}</span>
            <span>•</span>
            <span>{preset.age}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="download-btn primary"
          title={`Download 18×24 inch ${themeInfo.name} fine-art poster at 300 DPI (5400×7200 px PNG)`}
        >
          {isExporting ? '⏳ Rendering 300 DPI...' : `📥 Download 18×24" (${themeInfo.name})`}
        </button>
      </header>

      {/* Theme Switcher Bar */}
      <div className="poster-theme-selector">
        <span className="theme-selector-label">Artwork Theme:</span>
        <div className="theme-toggle-group">
          {(Object.keys(POSTER_THEMES) as PosterThemeId[]).map((themeKey) => {
            const theme = POSTER_THEMES[themeKey];
            const active = activeTheme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                className={`theme-toggle-btn ${active ? 'active' : ''}`}
                onClick={() => setActiveTheme(themeKey)}
              >
                <strong>{theme.badge}</strong>
                <span className="theme-btn-desc">{theme.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="poster-canvas-stage">
        <div className={`canvas-frame ${themeInfo.isLight ? 'light-frame' : 'dark-frame'}`}>
          <canvas ref={canvasRef} className="poster-canvas" />
        </div>

        <div className="poster-specs-bar">
          <div className="specs-col">
            <strong>18 × 24 inches (45.7 × 61.0 cm) · {themeInfo.name} Edition</strong>
            <span>5,400 × 7,200 px · 300 DPI Lossless PNG</span>
          </div>
          <div className="specs-col text-right">
            <strong>NASA IPAC 2MASS Infrared Survey</strong>
            <span>100% U.S. Public Domain · Ready for Gelato &amp; Printify</span>
          </div>
        </div>

        <div className="poster-description-box">
          <h3>About {preset.label}</h3>
          <p>{preset.subtitle}</p>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomeView} />
      <Route path="/cluster/:id" component={ClusterPosterView} />
      {/* Backward-compatible routes */}
      <Route path="/chart/:id" component={ClusterPosterView} />
      <Route path="/gallery" component={HomeView} />
      <Route>
        <HomeView />
      </Route>
    </Switch>
  );
}

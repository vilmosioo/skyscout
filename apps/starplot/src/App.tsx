import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Switch, useParams } from 'wouter';
import { NasaClient } from '@skyscout/nasa-client';
import type { GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  downloadGalleryPoster,
  drawEtsyShopBanner,
  drawEtsyShopLogo,
  fetchNasaClusterStars,
  formatPosterTitle,
  generateClusterFallbackStars,
  generateClusterPreviewPoints,
  getCachedNasaStars,
  getEtsyListingCopy,
  HR_BOUNDS,
  POSTER_THEMES,
  type PosterThemeId,
  renderDetailCropMockup,
  renderFineArtPoster,
  renderFramedRoomMockup,
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
    return getCachedNasaStars(preset.id, 1000) ?? generateClusterFallbackStars(preset);
  }, [preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard 3:4 aspect ratio matching 18×24" fine-art poster dimensions (540×720 for crisp 2x DPR)
    canvas.width = 540;
    canvas.height = 720;

    const scale = 540 / 5400;
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
      themeId,
      stars: tagged,
      primaryPreset: preset,
    });

    ctx.restore();
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
            Fine-Art Astronomy Posters · 3 Curated Themes · {TARGET_PRESETS.length} Star Clusters
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

  const [showEtsyModal, setShowEtsyModal] = useState<boolean>(false);
  const [isExportingEtsy, setIsExportingEtsy] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const nasaClient = useMemo(() => new NasaClient(), []);
  const [stars, setStars] = useState<GaiaStar[]>(() => {
    return getCachedNasaStars(preset.id, 1000) ?? generateClusterFallbackStars(preset);
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  // Interactive Zoom & Pan State for inspecting poster details
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number }>({
    mouseX: 0,
    mouseY: 0,
    panX: 0,
    panY: 0,
  });
  const touchStartRef = useRef<{ dist: number; touchX: number; touchY: number } | null>(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [id, activeTheme]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5, Number((prev * 1.35).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, Number((prev / 1.35).toFixed(2)));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;

    const factor = e.deltaY < 0 ? 1.2 : 0.833;
    setZoom((prevZoom) => {
      const nextZoom = Math.max(1, Math.min(6, Number((prevZoom * factor).toFixed(2))));
      if (nextZoom <= 1.02) {
        setPan({ x: 0, y: 0 });
        return 1;
      }

      const scaleChange = nextZoom / prevZoom;
      setPan((prevPan) => {
        const nextPanX = cursorX - scaleChange * (cursorX - prevPan.x);
        const nextPanY = cursorY - scaleChange * (cursorY - prevPan.y);
        const maxPanX = (rect.width * (nextZoom - 1)) / 2;
        const maxPanY = (rect.height * (nextZoom - 1)) / 2;
        return {
          x: Math.max(-maxPanX, Math.min(maxPanX, nextPanX)),
          y: Math.max(-maxPanY, Math.min(maxPanY, nextPanY)),
        };
      });

      return nextZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const frame = frameRef.current;
    const rect = frame?.getBoundingClientRect();
    const width = rect?.width ?? 580;
    const height = rect?.height ?? (width * 4) / 3;

    const maxPanX = (width * (zoom - 1)) / 2;
    const maxPanY = (height * (zoom - 1)) / 2;

    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.panX + dx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.panY + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom > 1.2) {
      handleResetZoom();
    } else {
      setZoom(2.5);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      dragStartRef.current = {
        mouseX: e.touches[0].clientX,
        mouseY: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = {
        dist: Math.sqrt(dx * dx + dy * dy),
        touchX: pan.x,
        touchY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.mouseX;
      const dy = e.touches[0].clientY - dragStartRef.current.mouseY;
      const frame = frameRef.current;
      const rect = frame?.getBoundingClientRect();
      const width = rect?.width ?? 580;
      const height = rect?.height ?? (width * 4) / 3;
      const maxPanX = (width * (zoom - 1)) / 2;
      const maxPanY = (height * (zoom - 1)) / 2;
      setPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.panX + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.panY + dy)),
      });
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / touchStartRef.current.dist;
      setZoom((prev) => Math.max(1, Math.min(6, prev * ratio)));
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current = null;
  };

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

  const getMasterPosterCanvas = (): HTMLCanvasElement => {
    const master = document.createElement('canvas');
    master.width = 5400;
    master.height = 7200;
    const masterCtx = master.getContext('2d');
    if (masterCtx) {
      const starList = stars.length > 0 ? stars : generateClusterFallbackStars(preset);
      const tagged = starList.map((star) => ({
        star,
        sourceLabel: preset.shortName,
      }));
      renderFineArtPoster({
        ctx: masterCtx,
        width: 5400,
        height: 7200,
        bounds: HR_BOUNDS,
        themeId: activeTheme,
        stars: tagged,
        primaryPreset: preset,
      });
    }
    return master;
  };

  const downloadBlob = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDownloadHeroMockup = () => {
    const master = getMasterPosterCanvas();
    const mockup = document.createElement('canvas');
    mockup.width = 2400;
    mockup.height = 2000;
    const mockupCtx = mockup.getContext('2d');
    if (!mockupCtx) return;
    renderFramedRoomMockup({
      ctx: mockupCtx,
      posterCanvas: master,
      frameStyle: 'natural-oak',
    });
    mockup.toBlob((blob) => {
      downloadBlob(blob, `etsy-1-hero-framed-mockup-${preset.id}.jpg`);
    }, 'image/jpeg', 0.93);
  };

  const handleDownloadDetailCrop = () => {
    const master = getMasterPosterCanvas();
    const crop = document.createElement('canvas');
    crop.width = 2000;
    crop.height = 2000;
    const cropCtx = crop.getContext('2d');
    if (!cropCtx) return;
    renderDetailCropMockup({
      ctx: cropCtx,
      posterCanvas: master,
    });
    crop.toBlob((blob) => {
      downloadBlob(blob, `etsy-2-macro-detail-crop-${preset.id}.jpg`);
    }, 'image/jpeg', 0.93);
  };

  const handleDownloadShopLogo = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawEtsyShopLogo(ctx, 500, 500);
    canvas.toBlob((blob) => {
      downloadBlob(blob, 'starplot-etsy-shop-logo-500x500.png');
    }, 'image/png');
  };

  const handleDownloadShopBanner = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawEtsyShopBanner(ctx, 1200, 300);
    canvas.toBlob((blob) => {
      downloadBlob(blob, 'starplot-etsy-shop-banner-1200x300.png');
    }, 'image/png');
  };

  const handleDownloadAllEtsyAssets = async () => {
    setIsExportingEtsy(true);
    try {
      handleDownloadHeroMockup();
      setTimeout(() => handleDownloadDetailCrop(), 600);
      setTimeout(() => handleDownload(), 1200);
    } finally {
      setTimeout(() => setIsExportingEtsy(false), 2000);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const etsyCopy = useMemo(() => {
    return getEtsyListingCopy(preset, activeTheme);
  }, [preset, activeTheme]);

  const shopStoryText = `StarPlot was founded out of a fascination with astrophysics and celestial cartography. Most star maps only show where stars sit across the celestial sphere, hiding their physical nature.

Our charts bridge both worlds: connecting true astronomical sky coordinates directly with Hertzsprung–Russell diagrams. Every star is plotted from real space telescope and survey catalogs—including ESA Gaia DR3 astrometry and NASA 2MASS infrared archives.

We render every line with vector precision at 300 DPI, creating clean, scientifically grounded artwork for astronomers, stargazers, and anyone drawn to the night sky.`;

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

        <div className="poster-header-actions">
          <button
            type="button"
            onClick={() => setShowEtsyModal(true)}
            className="etsy-kit-btn"
            title="Open Etsy Quick Launch Kit with ready-to-upload mockups and SEO listing copy"
          >
            🛍️ Etsy Launch Kit
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="download-btn primary"
            title={`Download 18×24 inch ${themeInfo.name} fine-art poster at 300 DPI (5400×7200 px PNG)`}
          >
            {isExporting ? '⏳ Rendering 300 DPI...' : `📥 Download 18×24" (${themeInfo.name})`}
          </button>
        </div>
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
        <div
          ref={frameRef}
          className={`canvas-frame ${themeInfo.isLight ? 'light-frame' : 'dark-frame'} ${zoom > 1 ? 'is-zoomed' : ''} ${isDragging ? 'is-dragging' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className="canvas-zoom-wrapper"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <canvas ref={canvasRef} className="poster-canvas" />
          </div>

          {/* Floating Zoom & Pan Toolbar */}
          <div className="zoom-toolbar">
            <button
              type="button"
              className="zoom-tool-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 1}
              title="Zoom Out"
            >
              −
            </button>
            <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="zoom-tool-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 5}
              title="Zoom In"
            >
              +
            </button>
            {zoom > 1 && (
              <button
                type="button"
                className="zoom-tool-btn reset-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                title="Reset View"
              >
                ⟲ Reset
              </button>
            )}
          </div>

          {zoom === 1 && (
            <div className="zoom-hint-pill">
              Scroll or double-click to zoom &amp; inspect
            </div>
          )}
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

      {/* 🛍️ Etsy Quick Launch Kit Modal */}
      {showEtsyModal && (
        <div className="modal-backdrop" onClick={() => setShowEtsyModal(false)}>
          <div className="etsy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>🛍️ Etsy Quick Launch Kit</h2>
                <p>Everything you need to publish this listing and make a sale today</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEtsyModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Shop Branding: Logo & Banner */}
              <section className="modal-section">
                <h3>Shop Branding (Logo &amp; Banner)</h3>
                <p className="section-hint">Required graphics for your Etsy shop storefront:</p>
                <div className="etsy-assets-grid">
                  <div className="asset-card">
                    <span className="asset-badge">Shop Icon / Logo</span>
                    <strong>StarPlot Star Reticle</strong>
                    <span className="asset-dims">500 × 500 px · PNG (Circle-Crop Ready)</span>
                    <button
                      type="button"
                      className="asset-download-btn"
                      onClick={handleDownloadShopLogo}
                    >
                      ⬇ Download Logo (500×500)
                    </button>
                  </div>
                  <div className="asset-card">
                    <span className="asset-badge">Shop Banner</span>
                    <strong>StarPlot Panoramic Banner</strong>
                    <span className="asset-dims">1200 × 300 px · PNG (Storefront Header)</span>
                    <button
                      type="button"
                      className="asset-download-btn"
                      onClick={handleDownloadShopBanner}
                    >
                      ⬇ Download Banner (1200×300)
                    </button>
                  </div>
                </div>
              </section>

              {/* Step 1: Listing Photos */}
              <section className="modal-section">
                <h3>1. Listing Images (Mockups &amp; Detail Crops)</h3>
                <p className="section-hint">High-converting lifestyle photos ready to upload to Etsy Photos:</p>
                <div className="etsy-assets-grid">
                  <div className="asset-card">
                    <span className="asset-badge">Photo 1 · Hero</span>
                    <strong>Framed Room Mockup</strong>
                    <span className="asset-dims">2400 × 2000 px · Oak Gallery Frame</span>
                    <button
                      type="button"
                      className="asset-download-btn"
                      onClick={handleDownloadHeroMockup}
                    >
                      ⬇ Download Hero Mockup (JPG)
                    </button>
                  </div>
                  <div className="asset-card">
                    <span className="asset-badge">Photo 2 · Detail</span>
                    <strong>Macro Detail Crop</strong>
                    <span className="asset-dims">2000 × 2000 px · Crisp Vector Threads</span>
                    <button
                      type="button"
                      className="asset-download-btn"
                      onClick={handleDownloadDetailCrop}
                    >
                      ⬇ Download Detail Crop (JPG)
                    </button>
                  </div>
                  <div className="asset-card">
                    <span className="asset-badge">Digital Deliverable</span>
                    <strong>300 DPI Print File</strong>
                    <span className="asset-dims">5400 × 7200 px · 18×24" Lossless PNG</span>
                    <button
                      type="button"
                      className="asset-download-btn"
                      onClick={handleDownload}
                      disabled={isExporting}
                    >
                      ⬇ Download Print PNG
                    </button>
                  </div>
                </div>

                <div className="batch-download-row">
                  <button
                    type="button"
                    className="batch-download-btn"
                    onClick={handleDownloadAllEtsyAssets}
                    disabled={isExportingEtsy}
                  >
                    {isExportingEtsy ? '⏳ Exporting All Assets...' : '⚡ Download All 3 Assets in 1-Click'}
                  </button>
                </div>
              </section>

              {/* Step 2: Listing Copy */}
              <section className="modal-section">
                <h3>2. Copy-Paste Listing Details</h3>

                <div className="copy-field-group">
                  <div className="field-header">
                    <label>Listing Title (SEO-Optimized)</label>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyText(etsyCopy.title, 'title')}
                    >
                      {copiedField === 'title' ? '✓ Copied!' : '📋 Copy Title'}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={etsyCopy.title}
                    className="copy-input"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>

                <div className="copy-field-group">
                  <div className="field-header">
                    <label>13 Etsy Search Tags (Exact Match Algorithm)</label>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyText(etsyCopy.tags.join(', '), 'tags')}
                    >
                      {copiedField === 'tags' ? '✓ Copied!' : '📋 Copy All 13 Tags'}
                    </button>
                  </div>
                  <div className="tags-pill-list">
                    {etsyCopy.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="copy-field-group">
                  <div className="field-header">
                    <label>Listing Description</label>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyText(etsyCopy.description, 'desc')}
                    >
                      {copiedField === 'desc' ? '✓ Copied!' : '📋 Copy Description'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={6}
                    value={etsyCopy.description}
                    className="copy-textarea"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>

                <div className="pricing-recommendation-box">
                  <div className="pricing-badge">💰 Suggested Launch Pricing</div>
                  <div className="pricing-columns">
                    <div>
                      <strong>Digital Download (Instant Margin):</strong> <span>$8.90</span> (or run 25% launch sale at $6.67)
                    </div>
                    <div>
                      <strong>Physical Print (Gelato 18×24" Matte):</strong> <span>$34.00 – $38.00</span> ($18.50 profit/unit)
                    </div>
                  </div>
                </div>
              </section>

              {/* Shop Story & About */}
              <section className="modal-section">
                <h3>Shop Story &amp; About Section</h3>
                <p className="section-hint">Copy and paste this into Etsy's "Share your story" onboarding:</p>

                <div className="copy-field-group">
                  <div className="field-header">
                    <label>Story Headline</label>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyText('Bridging Celestial Sky Coordinates with Astrophysical Data', 'story-head')}
                    >
                      {copiedField === 'story-head' ? '✓ Copied!' : '📋 Copy Headline'}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value="Bridging Celestial Sky Coordinates with Astrophysical Data"
                    className="copy-input"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>

                <div className="copy-field-group">
                  <div className="field-header">
                    <label>About StarPlot Story</label>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyText(shopStoryText, 'story-body')}
                    >
                      {copiedField === 'story-body' ? '✓ Copied!' : '📋 Copy Story Text'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={6}
                    value={shopStoryText}
                    className="copy-textarea"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>
              </section>

              {/* Step 3: Launch Shop Action */}
              <section className="modal-section launch-action-section">
                <h3>3. Ready to Publish?</h3>
                <p>Open Etsy's seller onboarding, paste the details above, and publish your listing:</p>
                <a
                  href="https://www.etsy.com/sell"
                  target="_blank"
                  rel="noreferrer"
                  className="open-etsy-btn"
                >
                  🚀 Open Etsy Shop Manager (etsy.com/sell) ↗
                </a>
              </section>
            </div>
          </div>
        </div>
      )}
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

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  Search,
  Flame,
  Zap,
  Sparkles,
  Activity,
  Orbit,
  ArrowUpDown,
  Compass,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import { getLasairObjectUrl } from '@skyscout/lasair-client';
import { formatCoordinates } from '@skyscout/core';
import type { EnrichedCandidate } from './mockData';
import styles from './CardView.module.css';

interface CardViewProps {
  candidates: EnrichedCandidate[];
  onSelectCandidate: (id: string | number) => void;
  isDemoMode: boolean;
}

// Mini Canvas Diff Stamp Thumbnail
function MiniDiffThumbnail({
  diaObjectId,
  classification,
}: {
  diaObjectId: string | number;
  classification?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 110;
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

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const noise = (pseudoRandom(x * 19 + y * 29) - 0.5) * 14;
        let val = 20 + noise;

        // Difference PSF at center
        const dt = Math.hypot(x - center, y - center);
        const psf = Math.exp(-(dt * dt) / (2 * 2.6 * 2.6)) * 210;
        val += psf;

        // Inverted Astronomical Grayscale
        const inv = Math.max(0, Math.min(255, 255 - val * 1.15));
        data[idx] = inv;
        data[idx + 1] = inv;
        data[idx + 2] = inv;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Reticle
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center, center - 9);
    ctx.lineTo(center, center - 17);
    ctx.moveTo(center, center + 9);
    ctx.lineTo(center, center + 17);
    ctx.moveTo(center - 9, center);
    ctx.lineTo(center - 17, center);
    ctx.moveTo(center + 9, center);
    ctx.lineTo(center + 17, center);
    ctx.stroke();
  }, [diaObjectId, classification]);

  return (
    <div className={styles.miniThumbWrapper} title="Subtracted difference image (Science − Template)">
      <canvas ref={canvasRef} width={110} height={110} className={styles.miniThumbCanvas} />
      <span className={styles.diffBadgePill}>Diff PSF</span>
    </div>
  );
}

export function CardView({ candidates, onSelectCandidate }: CardViewProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SN' | 'NT' | 'CV' | 'AGN'>('ALL');
  const [sortBy, setSortBy] = useState<'mag' | 'snr' | 'epochs'>('mag');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(id));
    setCopiedId(String(id));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const matchesFilter = selectedFilter === 'ALL' || c.classification === selectedFilter;
        const matchesSearch =
          searchTerm.trim() === '' ||
          String(c.diaObjectId).includes(searchTerm.trim()) ||
          (c.classification && c.classification.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'mag') return (a.peakMag ?? 99) - (b.peakMag ?? 99);
        if (sortBy === 'snr') return (b.maxSnr ?? 0) - (a.maxSnr ?? 0);
        if (sortBy === 'epochs') return (b.epochCount ?? 0) - (a.epochCount ?? 0);
        return 0;
      });
  }, [candidates, selectedFilter, searchTerm, sortBy]);

  const handleInspect = (id: string | number) => {
    onSelectCandidate(id);
    setLocation('/console');
  };

  const getBandClass = (band?: string) => {
    switch (band) {
      case 'g': return styles.bandPillG;
      case 'r': return styles.bandPillR;
      case 'i': return styles.bandPillI;
      case 'u': return styles.bandPillU;
      case 'z': return styles.bandPillZ;
      default: return styles.bandPillR;
    }
  };

  const getClassBadgeStyle = (cls?: string) => {
    switch (cls) {
      case 'SN': return styles.classBadgeSn;
      case 'NT': return styles.classBadgeNt;
      case 'CV': return styles.classBadgeCv;
      case 'AGN': return styles.classBadgeAgn;
      default: return '';
    }
  };

  return (
    <div className={styles.cardViewPage}>
      {/* Hero / Filter Bar */}
      <section className={styles.cardViewToolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by Rubin DIA Object ID, class, or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button className={styles.clearBtn} onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className={styles.filterChipsRow}>
          <button
            className={`${styles.filterChip} ${selectedFilter === 'ALL' ? styles.filterChipActive : ''}`}
            onClick={() => setSelectedFilter('ALL')}
          >
            <Orbit size={14} />
            <span>All Alerts ({candidates.length})</span>
          </button>
          <button
            className={`${styles.filterChip} ${selectedFilter === 'SN' ? `${styles.filterChipActive} ${styles.filterChipSnActive}` : ''}`}
            onClick={() => setSelectedFilter('SN')}
          >
            <Flame size={14} />
            <span>Supernovae (SN)</span>
          </button>
          <button
            className={`${styles.filterChip} ${selectedFilter === 'NT' ? `${styles.filterChipActive} ${styles.filterChipNtActive}` : ''}`}
            onClick={() => setSelectedFilter('NT')}
          >
            <Zap size={14} />
            <span>Nuclear / TDE (NT)</span>
          </button>
          <button
            className={`${styles.filterChip} ${selectedFilter === 'CV' ? `${styles.filterChipActive} ${styles.filterChipCvActive}` : ''}`}
            onClick={() => setSelectedFilter('CV')}
          >
            <Sparkles size={14} />
            <span>Cataclysmic (CV)</span>
          </button>
          <button
            className={`${styles.filterChip} ${selectedFilter === 'AGN' ? `${styles.filterChipActive} ${styles.filterChipAgnActive}` : ''}`}
            onClick={() => setSelectedFilter('AGN')}
          >
            <Activity size={14} />
            <span>AGN</span>
          </button>
        </div>

        {/* Sort Options */}
        <div className={styles.sortBox}>
          <ArrowUpDown size={14} className={styles.sortIcon} />
          <span className={styles.sortLabel}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'mag' | 'snr' | 'epochs')}
            className={styles.sortSelect}
          >
            <option value="mag">Peak Brightness (AB Mag)</option>
            <option value="snr">Signal-to-Noise (SNR)</option>
            <option value="epochs">Most Detections</option>
          </select>
        </div>
      </section>

      {/* Grid of Discovery Cards */}
      <section className={styles.transientCardsGrid}>
        {filteredCandidates.map((cand) => {
          const coords = formatCoordinates(cand.ra, cand.decl, 4);

          return (
            <div
              key={cand.diaObjectId}
              className={styles.transientCard}
              onClick={() => handleInspect(cand.diaObjectId)}
            >
              <div className={styles.cardTop}>
                {/* Visual Difference Image Stamp */}
                <MiniDiffThumbnail
                  diaObjectId={cand.diaObjectId}
                  classification={cand.classification}
                />

                <div className={styles.cardTopDetails}>
                  <div className={styles.cardHeaderTags}>
                    <span className={`${styles.classBadge} ${getClassBadgeStyle(cand.classification)}`}>
                      {cand.classification === 'SN' && <Flame size={12} />}
                      {cand.classification === 'NT' && <Zap size={12} />}
                      {cand.classification === 'CV' && <Sparkles size={12} />}
                      {cand.classification === 'AGN' && <Activity size={12} />}
                      <span>{cand.classification}</span>
                    </span>

                    <button
                      className={styles.copyIdBtn}
                      onClick={(e) => handleCopyId(cand.diaObjectId, e)}
                      title="Copy Rubin DIA Object ID"
                    >
                      {copiedId === String(cand.diaObjectId) ? (
                        <Check size={13} className={styles.textEmerald} />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <h3 className={`${styles.cardObjectId} mono`}>{cand.diaObjectId}</h3>

                  <div className={styles.cardCoords}>
                    <Compass size={13} className={styles.coordsIcon} />
                    <span className="mono">
                      {coords.raStr}°, {coords.decStr}°
                    </span>
                  </div>
                </div>
              </div>

              {cand.description && (
                <p className={styles.cardDescription}>{cand.description}</p>
              )}

              {/* Astrophysics Metrics Bar */}
              <div className={styles.cardMetricsGrid}>
                <div className={styles.metricCell}>
                  <span className={styles.metricCaption}>Peak Mag</span>
                  <strong className={`${styles.metricVal} ${styles.textAmber} mono`}>
                    {cand.peakMag ? `${cand.peakMag.toFixed(2)} mag` : '—'}
                  </strong>
                </div>

                <div className={styles.metricCell}>
                  <span className={styles.metricCaption}>Band</span>
                  <strong className={styles.metricVal}>
                    <span className={`${styles.bandPill} ${getBandClass(cand.peakBand)}`}>
                      {cand.peakBand || 'r'}-band
                    </span>
                  </strong>
                </div>

                <div className={styles.metricCell}>
                  <span className={styles.metricCaption}>Detections</span>
                  <strong className={`${styles.metricVal} mono`}>
                    <Layers size={12} className={styles.metricIcon} />
                    {cand.epochCount || 1} epochs
                  </strong>
                </div>

                <div className={styles.metricCell}>
                  <span className={styles.metricCaption}>Discovered</span>
                  <span className={`${styles.metricVal} text-muted`}>
                    <Clock size={12} className={styles.metricIcon} />
                    {cand.discoveryDate || 'Recent'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.cardActionBar}>
                <button
                  className={styles.cardPrimaryAction}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspect(cand.diaObjectId);
                  }}
                >
                  <Eye size={14} />
                  <span>Inspect Light Curve &amp; Diff</span>
                  <ChevronRight size={14} />
                </button>

                <a
                  href={getLasairObjectUrl(cand.diaObjectId)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.cardPortalLink}
                  onClick={(e) => e.stopPropagation()}
                  title="View on official Lasair LSST portal"
                >
                  <span>Portal</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {filteredCandidates.length === 0 && (
        <div className={styles.emptyStateBox}>
          <Orbit size={48} className={styles.emptyIcon} />
          <h3>No transient alerts match your criteria</h3>
          <p>Try clearing your search query or switching classification filter tags.</p>
          <button
            className={styles.secondaryBtn}
            onClick={() => {
              setSearchTerm('');
              setSelectedFilter('ALL');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Telescope,
  Search,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  LasairClient,
  type RubinDiaSource,
  getLasairObjectUrl,
} from '@skyscout/lasair-client';
import {
  formatCoordinates,
  formatHms,
  formatDms,
  formatObservationDate,
  mjdToDate,
  fluxToAbMag,
} from '@skyscout/core';
import { StampViewer } from './StampViewer';
import { MiniDiffThumbnail } from './MiniDiffThumbnail';
import styles from './App.module.css';

interface AlertRow {
  diaObjectId: string | number;
  ra: number;
  decl: number;
  latest_psfFlux?: number | null;
  lastDiaSourceMjdTai?: number | null;
  classification?: string;
  [key: string]: unknown;
}

type ClassificationFilter = 'SN' | 'NT' | 'CV' | 'AGN' | 'VS' | 'ALL';

export default function App() {
  const envToken = import.meta.env.VITE_LASAIR_TOKEN || '';
  const token = envToken.trim();

  // Initialize LasairClient with local '/api' reverse proxy to avoid browser preflight CORS 401
  const client = useMemo(() => {
    if (!token) return null;
    try {
      const endpoint = import.meta.env.VITE_LASAIR_ENDPOINT || '/api';
      return new LasairClient({ token, endpoint });
    } catch {
      return null;
    }
  }, [token]);

  // Query Filters
  const [classification, setClassification] = useState<ClassificationFilter>('SN');
  const [limit, setLimit] = useState<number>(25);
  const [sortBy, setSortBy] = useState<'newest' | 'brightest'>('newest');

  // Results & UI State
  const [results, setResults] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inline Inspection (Cutouts)
  const [inspectedTarget, setInspectedTarget] = useState<{
    id: string;
    source: RubinDiaSource;
    detectionCount?: number;
  } | null>(null);
  const [inspectLoadingId, setInspectLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${text} to clipboard!`);
    });
  };

  // Primary Query Function
  const runQuery = useCallback(async () => {
    if (!client) {
      setError('Missing VITE_LASAIR_TOKEN in .env. Please configure your token.');
      return;
    }

    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const selected =
        'objects.diaObjectId, objects.ra, objects.decl, objects.latest_psfFlux, objects.lastDiaSourceMjdTai, sherlock_classifications.classification';
      const tables = 'objects, sherlock_classifications';

      let conditions = 'objects.diaObjectId = sherlock_classifications.diaObjectId';
      if (classification !== 'ALL') {
        conditions += ` AND sherlock_classifications.classification = '${classification}'`;
      }

      if (sortBy === 'newest') {
        conditions += ' ORDER BY objects.lastDiaSourceMjdTai DESC';
      } else {
        conditions += ' ORDER BY objects.latest_psfFlux DESC';
      }

      const rows = await client.query<AlertRow>({
        selected,
        tables,
        conditions,
        limit,
      });

      const elapsed = Math.round(performance.now() - start);
      setExecutionTimeMs(elapsed);
      setResults(rows || []);
    } catch (err: unknown) {
      setError((err as Error).message || 'Query execution failed.');
    } finally {
      setLoading(false);
    }
  }, [client, classification, limit, sortBy]);

  // Execute query on initial launch
  useEffect(() => {
    if (client) {
      runQuery();
    }
  }, [client]);

  // Handle Cutout Inspection
  const handleInspect = async (row: AlertRow) => {
    const objId = String(row.diaObjectId);
    if (inspectedTarget?.id === objId) {
      setInspectedTarget(null);
      return;
    }

    if (!client) return;

    setInspectLoadingId(objId);
    try {
      const res = await client.object(objId, { lite: true, lasairAdded: true });
      const latestSource = res?.diaSourcesList?.[0] || {
        diaSourceId: objId,
        midpointMjdTai: row.lastDiaSourceMjdTai || 61235.4,
        band: 'r',
        psfFlux: row.latest_psfFlux || 2500,
        psfFluxErr: 50,
      };

      setInspectedTarget({
        id: objId,
        source: latestSource,
        detectionCount: res?.diaSourcesList?.length || 1,
      });
    } catch {
      // Fallback pseudo source if detailed object fetch fails
      setInspectedTarget({
        id: objId,
        source: {
          diaSourceId: objId,
          midpointMjdTai: row.lastDiaSourceMjdTai || 61235.4,
          band: 'r',
          psfFlux: row.latest_psfFlux || 2500,
          psfFluxErr: 50,
        },
        detectionCount: 1,
      });
    } finally {
      setInspectLoadingId(null);
    }
  };

  // Export Results to CSV
  const downloadCsv = () => {
    if (results.length === 0) return;
    let csv = 'diaObjectId,classification,ra,decl,ra_hms,dec_dms,latest_mjd,latest_utc,latest_relative,latest_psfFlux,mag_ab\n';
    results.forEach((r) => {
      const hms = formatHms(r.ra, 1, 'units');
      const dms = formatDms(r.decl, 1, 'units');
      const abMagVal = typeof r.latest_psfFlux === 'number' ? fluxToAbMag(r.latest_psfFlux) : null;
      const mag = abMagVal !== null ? abMagVal.toFixed(2) : '';
      const obs = formatObservationDate(r.lastDiaSourceMjdTai);
      const obsUtc = obs ? obs.fullUtc : '';
      const obsRel = obs ? obs.relativeTime : '';
      csv += `${r.diaObjectId},${r.classification || ''},${r.ra},${r.decl},"${hms}","${dms}",${r.lastDiaSourceMjdTai || ''},"${obsUtc}","${obsRel}",${r.latest_psfFlux || ''},${mag}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rubin_alerts_${classification.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${results.length} alerts to CSV!`);
  };

  // Filtered view by user search string
  const displayedResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const q = searchTerm.toLowerCase().trim();
    return results.filter(
      (r) =>
        String(r.diaObjectId).includes(q) ||
        (r.classification && r.classification.toLowerCase().includes(q)) ||
        String(r.ra).includes(q) ||
        String(r.decl).includes(q)
    );
  }, [results, searchTerm]);

  return (
    <div className={styles.appContainer}>
      {/* 1. Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Telescope size={22} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>SkyScout</h1>
              <span className="text-xs bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded font-mono">
                Rubin LSST Alert Stream
              </span>
            </div>
            <p className={styles.subtitle}>
              Live Difference Image Analysis (DIA) Transient Query
            </p>
          </div>
        </div>
      </header>

      {/* Missing Token Alert */}
      {!token && (
        <div className={styles.errorBox}>
          <strong>⚠️ Authentication Token Required:</strong> Add{' '}
          <code className="bg-red-950/60 px-1.5 py-0.5 rounded text-red-300 font-mono">
            VITE_LASAIR_TOKEN=your_token_here
          </code>{' '}
          to your <code className="font-mono">.env</code> file in the repository root, then refresh the page.
        </div>
      )}

      {/* 2. Filter & Query Controls Panel */}
      <section className={styles.queryPanel}>
        {/* Classification Filters Row */}
        <div className={styles.filterRow}>
          <div className={styles.pillGroup}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Class:
            </span>
            {(
              [
                { id: 'SN', label: '💥 Supernovae (SN)' },
                { id: 'NT', label: '🕳️ Nuclear (TDE)' },
                { id: 'CV', label: '⚡ Cataclysmic (CV)' },
                { id: 'AGN', label: '🌌 AGN' },
                { id: 'VS', label: '⭐ Variable Stars (VS)' },
                { id: 'ALL', label: 'All Alerts' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setClassification(item.id)}
                className={`${styles.pillBtn} ${classification === item.id ? styles.pillBtnActive : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={runQuery}
            disabled={loading || !token}
            className={styles.runBtn}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Executing Query...' : 'Run Query'}</span>
          </button>
        </div>

        {/* Secondary Parameters Row */}
        <div className={styles.controlsRow}>
          {/* Limit */}
          <div className={styles.controlField}>
            <span>Limit:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className={styles.selectInput}
            >
              <option value={10}>10 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
            </select>
          </div>

          {/* Sort By */}
          <div className={styles.controlField}>
            <span>Order by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'brightest')}
              className={styles.selectInput}
            >
              <option value="newest">Latest Detection (MJD Desc)</option>
              <option value="brightest">Brightest First (PSF Flux Desc)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && <div className={styles.errorBox}>{error}</div>}

      {/* 3. Results Section */}
      <section className={styles.resultsSection}>
        <div className={styles.resultsHeader}>
          <div className={styles.resultsCount}>
            <span>{results.length} Alerts Returned</span>
            {executionTimeMs !== null && (
              <span className={styles.timeTag}>
                ({executionTimeMs}ms execution)
              </span>
            )}
          </div>

          <div className={styles.resultsActions}>
            <input
              type="text"
              placeholder="Filter results by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchBox}
            />

            <button
              type="button"
              onClick={downloadCsv}
              disabled={results.length === 0}
              className={styles.csvBtn}
              title="Download results as CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                <th style={{ width: '64px', textAlign: 'center' }}>Cutout</th>
                <th>DIA Object ID</th>
                <th>Classification</th>
                <th>Coordinates (RA, Dec)</th>
                <th>Latest Observation</th>
                <th>Latest Flux / Magnitude</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedResults.map((row) => {
                const objId = String(row.diaObjectId);
                const isInspected = inspectedTarget?.id === objId;
                const coords = formatCoordinates(row.ra, row.decl, 4);
                const hms = formatHms(row.ra, 1, 'units');
                const dms = formatDms(row.decl, 1, 'units');

                const obs = formatObservationDate(row.lastDiaSourceMjdTai);

                const abMagVal =
                  typeof row.latest_psfFlux === 'number' ? fluxToAbMag(row.latest_psfFlux) : null;
                const magAb = abMagVal !== null ? `${abMagVal.toFixed(2)} mag` : null;

                let badgeStyle = styles.badgeDefault;
                if (row.classification === 'SN') badgeStyle = styles.badgeSN;
                else if (row.classification === 'CV') badgeStyle = styles.badgeCV;
                else if (row.classification === 'NT') badgeStyle = styles.badgeNT;
                else if (row.classification === 'AGN') badgeStyle = styles.badgeAGN;
                else if (row.classification === 'VS') badgeStyle = styles.badgeVS;

                return (
                  <React.Fragment key={objId}>
                    <tr className={isInspected ? styles.rowSelected : ''}>
                      {/* Inline Cutout Image Thumbnail */}
                      <td className={styles.cutoutCell}>
                        <button
                          type="button"
                          onClick={() => handleInspect(row)}
                          className={styles.miniStampBtn}
                          title="Click to expand full Difference Image Analysis (DIA) stamps inline"
                        >
                          <MiniDiffThumbnail
                            diaObjectId={row.diaObjectId}
                            classification={row.classification}
                            flux={row.latest_psfFlux}
                            size={48}
                          />
                        </button>
                      </td>

                      {/* Object ID */}
                      <td>
                        <div className={styles.objIdCell}>
                          <span>{objId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(objId)}
                            title="Copy DIA Object ID"
                            className={styles.copyIconBtn}
                          >
                            <Copy size={12} />
                          </button>
                          <a
                            href={getLasairObjectUrl(objId)}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.portalLink}
                            title="View on official Lasair LSST portal"
                          >
                            Portal ↗
                          </a>
                        </div>
                      </td>

                      {/* Classification */}
                      <td>
                        <span className={badgeStyle}>
                          {row.classification || 'Unclassified'}
                        </span>
                      </td>

                      {/* Coordinates */}
                      <td>
                        <div className={styles.cellStack}>
                          <span className={styles.coordText}>
                            RA: {coords.raStr}° <span className={styles.coordSub}>({hms})</span>
                          </span>
                          <span className={styles.coordText}>
                            Dec: {coords.decStr}° <span className={styles.coordSub}>({dms})</span>
                          </span>
                        </div>
                      </td>

                      {/* Latest Observation */}
                      <td>
                        {obs ? (
                          <div
                            className={styles.cellStack}
                            title={`Observation Timestamp:\nUTC: ${obs.dateUtc} ${obs.timeUtc} UTC\nISO: ${obs.iso}\nEpoch: ${obs.mjdStr} (${obs.relativeTime})`}
                          >
                            <div className={styles.obsPrimaryRow}>
                              <span className={styles.obsDate}>{obs.dateUtc}</span>
                              <span className={styles.obsTime}>{obs.timeUtc.slice(0, 5)} UTC</span>
                              <span
                                className={`${styles.recencyBadge} ${
                                  obs.isRecent ? styles.recencyBadgeRecent : styles.recencyBadgeOld
                                }`}
                              >
                                {obs.relativeTime}
                              </span>
                            </div>
                            <div className={styles.obsMetaRow}>
                              <span className={styles.obsMjd}>{obs.mjdStr}</span>
                            </div>
                          </div>
                        ) : (
                          <span className={styles.emptyVal}>No observation data</span>
                        )}
                      </td>

                      {/* Flux / Mag */}
                      <td>
                        <div className={styles.cellStack}>
                          <span
                            className={`${styles.fluxMag} ${
                              row.latest_psfFlux && row.latest_psfFlux > 0
                                ? styles.fluxPositive
                                : styles.fluxMuted
                            }`}
                          >
                            {magAb || (row.latest_psfFlux ? `${Math.round(row.latest_psfFlux)} nJy` : 'N/A')}
                          </span>
                          {magAb && row.latest_psfFlux && (
                            <span className={styles.fluxSub}>
                              {Math.round(row.latest_psfFlux)} nJy
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleInspect(row)}
                          disabled={inspectLoadingId === objId}
                          className={`${styles.inspectBtn} ${isInspected ? styles.inspectBtnActive : ''}`}
                        >
                          {inspectLoadingId === objId
                            ? 'Loading...'
                            : isInspected
                              ? 'Hide Stamps ▲'
                              : 'Inspect Stamps ▼'}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Expanded Stamp Viewer under this row */}
                    {isInspected && (
                      <tr className={styles.inlineExpandRow}>
                        <td colSpan={7}>
                          <div className={styles.inlineInspectorContainer}>
                            <div className={styles.inlineInspectorHeader}>
                              <div className={styles.inspectorTitle}>
                                <Layers size={18} className="text-blue-400" />
                                <span>Difference Image Analysis (DIA) Cutouts for Object {inspectedTarget.id}</span>
                                {inspectedTarget.detectionCount && (
                                  <span className={styles.visitTag}>
                                    {inspectedTarget.detectionCount} total visits
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => setInspectedTarget(null)}
                                className={styles.closeDrawerBtn}
                                title="Close inline cutouts"
                              >
                                ✕
                              </button>
                            </div>

                            <StampViewer
                              source={inspectedTarget.source}
                              objectId={inspectedTarget.id}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {!loading && displayedResults.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <Telescope size={32} className="text-slate-600" />
                    <span>No alerts found matching current filter criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

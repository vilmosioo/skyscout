import React, { useState, useMemo } from 'react';
import {
  type LasairClient,
  getLasairObjectUrl,
  getLasairSourceUrl,
  type RubinTransientCandidate,
  type RubinObjectResponse,
  type ConeSearchResult,
  type SherlockResponse,
} from '@skyscout/lasair-client';
import {
  formatCoordinates,
  formatHms,
  formatDms,
  mjdToDate,
  fluxToAbMag,
  fluxErrorToMagError,
  signalToNoise,
} from '@skyscout/core';
import {
  MOCK_QUERY_CANDIDATES,
  MOCK_OBJECT_RESPONSE,
  MOCK_CONE_RESULT,
  MOCK_SHERLOCK_RESPONSE,
} from './mockData';
import { StampViewer } from './StampViewer';
import {
  Flame,
  Zap,
  Sparkles,
  Activity,
  Orbit,
  Compass,
  Database,
  Crosshair,
  Send,
} from 'lucide-react';
import styles from './ConsoleView.module.css';

const BAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  u: { bg: 'rgba(124, 58, 237, 0.2)', text: '#a78bfa', border: '#7c3aed' },
  g: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#10b981' },
  r: { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: '#ef4444' },
  i: { bg: 'rgba(249, 115, 22, 0.2)', text: '#fb923c', border: '#f97316' },
  z: { bg: 'rgba(185, 28, 28, 0.2)', text: '#fca5a5', border: '#b91c1c' },
  y: { bg: 'rgba(131, 24, 67, 0.2)', text: '#f472b6', border: '#db2777' },
};

interface ConsoleViewProps {
  client: LasairClient | null;
  isDemoMode: boolean;
  targetObjectId: string;
  setTargetObjectId: (id: string) => void;
  setLastRawPayload: (payload: unknown) => void;
}

export function ConsoleView({
  client,
  isDemoMode,
  targetObjectId,
  setTargetObjectId,
  setLastRawPayload,
}: ConsoleViewProps) {
  // Card 1: Transient SQL Query State
  const [queryFilter, setQueryFilter] = useState<'SN' | 'NT' | 'CV' | 'AGN' | 'ALL'>('SN');
  const [queryLimit, setQueryLimit] = useState<number>(5);
  const [queryResults, setQueryResults] = useState<RubinTransientCandidate[]>(MOCK_QUERY_CANDIDATES);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const runQuery = async (selectedFilter = queryFilter) => {
    setQueryLoading(true);
    setQueryError(null);
    try {
      if (isDemoMode || !client) {
        await new Promise((r) => setTimeout(r, 400));
        const filtered = selectedFilter === 'ALL'
          ? MOCK_QUERY_CANDIDATES
          : MOCK_QUERY_CANDIDATES.filter((c) => c.classification === selectedFilter);
        setQueryResults(filtered);
        setLastRawPayload(filtered);
      } else {
        const baseConditions = selectedFilter === 'ALL'
          ? 'objects.diaObjectId = sherlock_classifications.diaObjectId'
          : `objects.diaObjectId = sherlock_classifications.diaObjectId AND sherlock_classifications.classification = '${selectedFilter}'`;
        const conditions = `${baseConditions} ORDER BY objects.lastDiaSourceMjdTai DESC`;
        const res = await client.query({
          selected: 'objects.diaObjectId, objects.ra, objects.decl, objects.lastDiaSourceMjdTai, sherlock_classifications.classification',
          tables: 'objects, sherlock_classifications',
          conditions,
          limit: queryLimit,
        });
        setQueryResults(res);
        setLastRawPayload(res);
      }
    } catch (err: unknown) {
      setQueryError((err as Error).message);
    } finally {
      setQueryLoading(false);
    }
  };

  // Card 2: Sky Cone Search State
  const [coneRa, setConeRa] = useState<number>(52.8238);
  const [coneDec, setConeDec] = useState<number>(-28.1002);
  const [coneRadius, setConeRadius] = useState<number>(10);
  const [coneType, setConeType] = useState<'all' | 'nearest'>('all');
  const [coneResults, setConeResults] = useState<ConeSearchResult | null>(MOCK_CONE_RESULT);
  const [coneLoading, setConeLoading] = useState<boolean>(false);
  const [coneError, setConeError] = useState<string | null>(null);

  const runConeSearch = async () => {
    setConeLoading(true);
    setConeError(null);
    try {
      if (isDemoMode || !client) {
        await new Promise((r) => setTimeout(r, 400));
        setConeResults(MOCK_CONE_RESULT);
        setLastRawPayload(MOCK_CONE_RESULT);
      } else {
        const res = await client.cone({
          ra: coneRa,
          dec: coneDec,
          radius: coneRadius,
          requestType: coneType,
        });
        setConeResults(res);
        setLastRawPayload(res);
      }
    } catch (err: unknown) {
      setConeError((err as Error).message);
    } finally {
      setConeLoading(false);
    }
  };

  // Card 3: Light Curve DIA Photometry State
  const [objectData, setObjectData] = useState<RubinObjectResponse | null>(MOCK_OBJECT_RESPONSE);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>('220019695992242804');
  const [objectLoading, setObjectLoading] = useState<boolean>(false);
  const [objectError, setObjectError] = useState<string | null>(null);

  const activeSource = useMemo(() => {
    if (!objectData?.diaSourcesList?.length) return null;
    return (
      objectData.diaSourcesList.find((s) => String(s.diaSourceId) === selectedSourceId) ||
      objectData.diaSourcesList[0]
    );
  }, [objectData, selectedSourceId]);

  const fetchObjectData = async (objId = targetObjectId) => {
    setObjectLoading(true);
    setObjectError(null);
    try {
      if (isDemoMode || !client) {
        await new Promise((r) => setTimeout(r, 450));
        setObjectData(MOCK_OBJECT_RESPONSE);
        setLastRawPayload(MOCK_OBJECT_RESPONSE);
      } else {
        const res = await client.object(objId, { lite: true, lasairAdded: true });
        setObjectData(res);
        setLastRawPayload(res);
      }
    } catch (err: unknown) {
      setObjectError((err as Error).message);
    } finally {
      setObjectLoading(false);
    }
  };

  // Card 4: Sherlock Context Engine State
  const [sherlockMode, setSherlockMode] = useState<'object' | 'position'>('object');
  const [sherlockObjId, setSherlockObjId] = useState<string>('170019695992242795');
  const [sherlockRa, setSherlockRa] = useState<number>(53.12541);
  const [sherlockDec, setSherlockDec] = useState<number>(-28.10023);
  const [sherlockData, setSherlockData] = useState<SherlockResponse | null>(MOCK_SHERLOCK_RESPONSE);
  const [sherlockLoading, setSherlockLoading] = useState<boolean>(false);
  const [sherlockError, setSherlockError] = useState<string | null>(null);

  const runSherlock = async () => {
    setSherlockLoading(true);
    setSherlockError(null);
    try {
      if (isDemoMode || !client) {
        await new Promise((r) => setTimeout(r, 400));
        setSherlockData(MOCK_SHERLOCK_RESPONSE);
        setLastRawPayload(MOCK_SHERLOCK_RESPONSE);
      } else {
        let res: SherlockResponse;
        if (sherlockMode === 'object') {
          res = await client.sherlockObject(sherlockObjId);
        } else {
          res = await client.sherlockPosition(sherlockRa, sherlockDec);
        }
        setSherlockData(res);
        setLastRawPayload(res);
      }
    } catch (err: unknown) {
      setSherlockError((err as Error).message);
    } finally {
      setSherlockLoading(false);
    }
  };

  // Card 5: Annotation State
  const [annObjId, setAnnObjId] = useState<string>('170019695992242795');
  const [annTopic, setAnnTopic] = useState<string>('skyscout_scout');
  const [annClassification, setAnnClassification] = useState<string>('SN Ia');
  const [annExplanation, setAnnExplanation] = useState<string>(
    'Multi-band rise in g & r bands matching standard Type Ia template with 4.8kpc host offset.'
  );
  const [annLoading, setAnnLoading] = useState<boolean>(false);
  const [annStatus, setAnnStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const submitAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnLoading(true);
    setAnnStatus(null);
    try {
      if (isDemoMode || !client) {
        await new Promise((r) => setTimeout(r, 500));
        const demoRes = { status: 'success', objectId: annObjId, topic: annTopic, recorded: true };
        setAnnStatus({
          ok: true,
          msg: `Demo simulated: Annotation "${annClassification}" for object ${annObjId} posted to topic "${annTopic}".`,
        });
        setLastRawPayload(demoRes);
      } else {
        const res = await client.annotate({
          objectId: annObjId,
          topic: annTopic,
          classification: annClassification,
          explanation: annExplanation,
        });
        setAnnStatus({ ok: true, msg: `Annotation broadcast successfully to Lasair broker.` });
        setLastRawPayload(res);
      }
    } catch (err: unknown) {
      setAnnStatus({ ok: false, msg: (err as Error).message });
    } finally {
      setAnnLoading(false);
    }
  };

  const selectTargetObject = (id: string | number) => {
    const sId = String(id);
    setTargetObjectId(sId);
    setSherlockObjId(sId);
    setAnnObjId(sId);
    fetchObjectData(sId);
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* CARD 1: SQL TRANSIENT QUERY */}
      <section className={`${styles.card} ${styles.cardQuery}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardBadge}>client.query</span>
            <h2 className={styles.cardTitle}>
              <Database size={18} className={styles.titleIcon} />
              Transient Alert SQL Query
            </h2>
          </div>
          <span className={styles.cardDesc}>
            Filter incoming Rubin DIA alerts by astrophysical classification.
          </span>
        </div>

        <div className={styles.queryControls}>
          <div className={styles.buttonGroup}>
            {(['SN', 'NT', 'CV', 'AGN', 'ALL'] as const).map((filter) => (
              <button
                key={filter}
                className={`${styles.filterBtn} ${queryFilter === filter ? styles.active : ''}`}
                onClick={() => {
                  setQueryFilter(filter);
                  runQuery(filter);
                }}
                disabled={queryLoading}
              >
                {filter === 'SN' && <Flame size={13} />}
                {filter === 'NT' && <Zap size={13} />}
                {filter === 'CV' && <Sparkles size={13} />}
                {filter === 'AGN' && <Activity size={13} />}
                {filter === 'ALL' && <Orbit size={13} />}
                <span>
                  {filter === 'SN' && 'Supernovae'}
                  {filter === 'NT' && 'Nuclear / TDE'}
                  {filter === 'CV' && 'Cataclysmic'}
                  {filter === 'AGN' && 'AGN'}
                  {filter === 'ALL' && 'All Alerts'}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.querySubcontrols}>
            <label>
              Limit:
              <select
                value={queryLimit}
                onChange={(e) => setQueryLimit(Number(e.target.value))}
                className={styles.selectInput}
              >
                <option value={5}>5 records</option>
                <option value={10}>10 records</option>
                <option value={25}>25 records</option>
              </select>
            </label>
            <button
              className={styles.primaryBtn}
              onClick={() => runQuery()}
              disabled={queryLoading}
            >
              {queryLoading ? 'Executing SQL...' : 'Run Query'}
            </button>
          </div>
        </div>

        {queryError && <div className={styles.errorBox}>{queryError}</div>}

        <div className={styles.candidateList}>
          {queryResults.map((cand) => {
            const coords = formatCoordinates(cand.ra, cand.decl, 4);
            const hms = formatHms(cand.ra, 1, 'units');
            const dms = formatDms(cand.decl, 1, 'units');

            return (
              <div key={cand.diaObjectId} className={styles.candidateRow}>
                <div className={styles.candidateInfo}>
                  <div className={styles.candidateIdRow}>
                    <span className={styles.objectIdBadge}>{cand.diaObjectId}</span>
                    {cand.classification && (
                      <span className={`${styles.tagBadge} ${cand.classification.toLowerCase()}`}>
                        {cand.classification}
                      </span>
                    )}
                    <a
                      href={getLasairObjectUrl(cand.diaObjectId)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.extLink}
                      title="View on Lasair LSST portal"
                    >
                      Portal ↗
                    </a>
                  </div>
                  <div className={styles.coordsRow}>
                    <span className="mono">
                      RA: {coords.raStr}° ({hms})
                    </span>
                    <span className={styles.sep}>•</span>
                    <span className="mono">
                      Dec: {coords.decStr}° ({dms})
                    </span>
                    {Boolean(cand.lastDiaSourceMjdTai) && (
                      <>
                        <span className={styles.sep}>•</span>
                        <span className="mono">
                          MJD: {Number(cand.lastDiaSourceMjdTai).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.candidateActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => selectTargetObject(cand.diaObjectId)}
                    title="Load DIA light curve & diff stamp"
                  >
                    ⚡ Diff &amp; Photometry
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => {
                      setSherlockObjId(String(cand.diaObjectId));
                      setSherlockMode('object');
                      runSherlock();
                    }}
                    title="Run Sherlock host classifier"
                  >
                    🔍 Sherlock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CARD 2: CONE SEARCH */}
      <section className={`${styles.card} ${styles.cardCone}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardBadge}>client.cone</span>
            <h2 className={styles.cardTitle}>
              <Crosshair size={18} className={styles.titleIcon} />
              Celestial Cone Search
            </h2>
          </div>
          <span className={styles.cardDesc}>
            Search for Rubin alerts within an angular radius on the sky.
          </span>
        </div>

        <div className={styles.presetBar}>
          <span className={styles.presetLabel}>Presets:</span>
          <button
            className={styles.chipBtn}
            onClick={() => {
              setConeRa(52.8238);
              setConeDec(-28.1002);
            }}
          >
            🌌 ELAIS-S1
          </button>
          <button
            className={styles.chipBtn}
            onClick={() => {
              setConeRa(53.1167);
              setConeDec(-27.808);
            }}
          >
            🔭 CDFS
          </button>
          <button
            className={styles.chipBtn}
            onClick={() => {
              setConeRa(150.1192);
              setConeDec(2.2058);
            }}
          >
            🪐 COSMOS
          </button>
        </div>

        <div className={styles.coneForm}>
          <div className={styles.inputRow}>
            <label className={styles.fieldGroup}>
              <span>RA (deg)</span>
              <input
                type="number"
                step="0.0001"
                value={coneRa}
                onChange={(e) => setConeRa(parseFloat(e.target.value) || 0)}
                className={styles.textInput}
              />
            </label>
            <label className={styles.fieldGroup}>
              <span>Dec (deg)</span>
              <input
                type="number"
                step="0.0001"
                value={coneDec}
                onChange={(e) => setConeDec(parseFloat(e.target.value) || 0)}
                className={styles.textInput}
              />
            </label>
            <label className={styles.fieldGroup}>
              <span>Radius: {coneRadius}″</span>
              <input
                type="range"
                min="1"
                max="60"
                value={coneRadius}
                onChange={(e) => setConeRadius(Number(e.target.value))}
                className={styles.rangeInput}
              />
            </label>
          </div>

          <div className={styles.coneSubmitRow}>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="coneType"
                  checked={coneType === 'all'}
                  onChange={() => setConeType('all')}
                />
                Return All
              </label>
              <label>
                <input
                  type="radio"
                  name="coneType"
                  checked={coneType === 'nearest'}
                  onChange={() => setConeType('nearest')}
                />
                Nearest
              </label>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={runConeSearch}
              disabled={coneLoading}
            >
              {coneLoading ? 'Searching Sky...' : 'Execute Cone Search'}
            </button>
          </div>
        </div>

        {coneError && <div className={styles.errorBox}>{coneError}</div>}

        {coneResults && (
          <div className={styles.coneResultsBox}>
            <div className={styles.coneSummaryBar}>
              <span>
                Matches: <strong>{coneResults.objects?.length ?? coneResults.count ?? 0}</strong>
              </span>
              {coneResults.nearest && (
                <span className={styles.nearestBadge}>
                  Nearest: <strong>{coneResults.nearest.separation.toFixed(2)}″</strong>
                </span>
              )}
            </div>

            <div className={styles.coneObjectsList}>
              {coneResults.objects?.map((obj, idx) => (
                <div key={idx} className={styles.coneObjectItem}>
                  <div>
                    <span
                      className={`mono ${styles.objectIdLink}`}
                      onClick={() => selectTargetObject(obj.object)}
                    >
                      {obj.object}
                    </span>
                  </div>
                  <div className={styles.coneSepBadge}>
                    Δθ: <strong>{obj.separation.toFixed(2)}″</strong>
                  </div>
                  <button
                    className={`${styles.actionBtn} ${styles.small}`}
                    onClick={() => selectTargetObject(obj.object)}
                  >
                    Inspect ↗
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CARD 3: PHOTOMETRY & DIFF STAMP TRIPLET */}
      <section className={`${styles.card} ${styles.cardPhotometry}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardBadge}>client.object</span>
            <h2 className={styles.cardTitle}>
              <Activity size={18} className={styles.titleIcon} />
              DIA Light Curve &amp; Cutout Image Triplet
            </h2>
          </div>
          <span className={styles.cardDesc}>
            Time-series Difference Image Analysis photometry and Science/Template/Diff stamp triplet.
          </span>
        </div>

        <div className={styles.objectInputBar}>
          <label className={`${styles.fieldGroup} ${styles.flex1}`}>
            <span>Rubin DIA Object ID</span>
            <input
              type="text"
              value={targetObjectId}
              onChange={(e) => setTargetObjectId(e.target.value)}
              className={`${styles.textInput} mono`}
              placeholder="e.g. 170019695992242795"
            />
          </label>
          <button
            className={styles.primaryBtn}
            onClick={() => fetchObjectData()}
            disabled={objectLoading}
          >
            {objectLoading ? 'Fetching...' : 'Fetch Detections'}
          </button>
        </div>

        {objectError && <div className={styles.errorBox}>{objectError}</div>}

        {objectData && (
          <div className={styles.photometryContent}>
            <div className={styles.metaBar}>
              <div>
                <span className={styles.metaLabel}>Object:</span>{' '}
                <strong className="mono">{objectData.diaObjectId}</strong>
              </div>
              <div>
                <span className={styles.metaLabel}>Coordinates:</span>{' '}
                <span className="mono">
                  {formatCoordinates(objectData.diaObject.ra, objectData.diaObject.decl, 4).raStr}°,{' '}
                  {formatCoordinates(objectData.diaObject.ra, objectData.diaObject.decl, 4).decStr}°
                </span>
              </div>
              <div>
                <span className={styles.metaLabel}>Detections:</span>{' '}
                <strong>{objectData.diaSourcesList?.length || 0} epochs</strong>
              </div>
            </div>

            <div className={styles.photometryTableWrapper}>
              <table className={styles.photometryTable}>
                <thead>
                  <tr>
                    <th>Filter</th>
                    <th>Date (UTC)</th>
                    <th>MJD (TAI)</th>
                    <th>PSF Flux (nJy)</th>
                    <th>AB Mag</th>
                    <th>SNR</th>
                    <th>Source &amp; Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {objectData.diaSourcesList?.map((src) => {
                    const utcDate = mjdToDate(src.midpointMjdTai);
                    const abMag = fluxToAbMag(src.psfFlux);
                    const magErr = fluxErrorToMagError(src.psfFlux, src.psfFluxErr);
                    const snr = src.snr ?? signalToNoise(src.psfFlux, src.psfFluxErr);
                    const bandStyle = BAND_COLORS[src.band] || {
                      bg: 'rgba(255,255,255,0.1)',
                      text: '#fff',
                      border: '#888',
                    };
                    const isSelected = activeSource?.diaSourceId === src.diaSourceId;

                    return (
                      <tr
                        key={src.diaSourceId}
                        className={`${styles.photometryRow} ${isSelected ? styles.selectedEpoch : ''}`}
                        onClick={() => setSelectedSourceId(String(src.diaSourceId))}
                      >
                        <td>
                          <span
                            className={styles.filterPill}
                            style={{
                              backgroundColor: bandStyle.bg,
                              color: bandStyle.text,
                              borderColor: bandStyle.border,
                            }}
                          >
                            {src.band}-band
                          </span>
                        </td>
                        <td className="mono text-muted">
                          {utcDate.toISOString().replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="mono">{src.midpointMjdTai.toFixed(2)}</td>
                        <td className="mono font-semibold">
                          {src.psfFlux.toFixed(1)} ± {src.psfFluxErr.toFixed(1)}
                        </td>
                        <td className="mono font-semibold">
                          {abMag !== null ? (
                            <span>
                              {abMag.toFixed(2)} {magErr ? `± ${magErr.toFixed(2)}` : ''}
                            </span>
                          ) : (
                            <span className="text-muted">Non-detection</span>
                          )}
                        </td>
                        <td>
                          <div className={styles.snrCell}>
                            <span className="mono">{snr !== null ? snr.toFixed(1) : '—'}</span>
                            <div className={styles.snrBarTrack}>
                              <div
                                className={styles.snrBarFill}
                                style={{ width: `${Math.min(100, ((snr || 0) / 60) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.sourceActionGroup}>
                            <button
                              className={`${styles.diffPillBtn} ${isSelected ? styles.active : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSourceId(String(src.diaSourceId));
                              }}
                              title="Inspect Difference / Science / Template stamp triplet"
                            >
                              ⚡ Diff Stamp
                            </button>
                            <a
                              href={getLasairSourceUrl(src.diaSourceId)}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.monoLink}
                              title="Inspect detection on Lasair"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {String(src.diaSourceId).slice(-6)} ↗
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Stamp Triplet Viewer */}
            {activeSource && (
              <StampViewer
                source={activeSource}
                objectId={objectData.diaObjectId}
                isDemoMode={isDemoMode}
              />
            )}
          </div>
        )}
      </section>

      {/* CARD 4: SHERLOCK CONTEXT ENGINE */}
      <section className={`${styles.card} ${styles.cardSherlock}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardBadge}>client.sherlock</span>
            <h2 className={styles.cardTitle}>
              <Compass size={18} className={styles.titleIcon} />
              Sherlock Context Classifier
            </h2>
          </div>
          <span className={styles.cardDesc}>
            Cross-match alerts against multi-wavelength catalogs (NED, Pan-STARRS, SIMBAD, Gaia).
          </span>
        </div>

        <div className={styles.sherlockTabs}>
          <button
            className={`${styles.tabBtn} ${sherlockMode === 'object' ? styles.active : ''}`}
            onClick={() => setSherlockMode('object')}
          >
            By Object ID
          </button>
          <button
            className={`${styles.tabBtn} ${sherlockMode === 'position' ? styles.active : ''}`}
            onClick={() => setSherlockMode('position')}
          >
            By Sky Position
          </button>
        </div>

        <div className={styles.sherlockForm}>
          {sherlockMode === 'object' ? (
            <label className={`${styles.fieldGroup} ${styles.flex1}`}>
              <span>Rubin DIA Object ID</span>
              <input
                type="text"
                value={sherlockObjId}
                onChange={(e) => setSherlockObjId(e.target.value)}
                className={`${styles.textInput} mono`}
              />
            </label>
          ) : (
            <div className={styles.inputRow}>
              <label className={styles.fieldGroup}>
                <span>RA (deg)</span>
                <input
                  type="number"
                  step="0.0001"
                  value={sherlockRa}
                  onChange={(e) => setSherlockRa(parseFloat(e.target.value) || 0)}
                  className={styles.textInput}
                />
              </label>
              <label className={styles.fieldGroup}>
                <span>Dec (deg)</span>
                <input
                  type="number"
                  step="0.0001"
                  value={sherlockDec}
                  onChange={(e) => setSherlockDec(parseFloat(e.target.value) || 0)}
                  className={styles.textInput}
                />
              </label>
            </div>
          )}
          <button
            className={styles.primaryBtn}
            onClick={runSherlock}
            disabled={sherlockLoading}
          >
            {sherlockLoading ? 'Classifying...' : 'Classify Context'}
          </button>
        </div>

        {sherlockError && <div className={styles.errorBox}>{sherlockError}</div>}

        {sherlockData && (
          <div className={styles.sherlockResults}>
            {sherlockData.classifications && (
              <div className={styles.sherlockClassificationBox}>
                <div className={styles.classificationBadge}>
                  {Object.values(sherlockData.classifications)[0]?.[0] || 'Unknown'}
                </div>
                <div className={styles.classificationDesc}>
                  {Object.values(sherlockData.classifications)[0]?.[1] ||
                    'Contextual classification generated from host galaxy cross-matching.'}
                </div>
              </div>
            )}

            <div className={styles.crossmatchHeading}>
              Host Catalog Crossmatches ({sherlockData.crossmatches?.length || 0})
            </div>
            <div className={styles.crossmatchList}>
              {sherlockData.crossmatches?.map((match, idx) => (
                <div key={idx} className={styles.crossmatchCard}>
                  <div className={styles.crossmatchHeader}>
                    <span className={styles.catTableBadge}>{match.catalogue_table_name}</span>
                    <span className="mono font-semibold">{match.catalogue_object_id}</span>
                    <span className={styles.matchTypePill}>{match.association_type}</span>
                  </div>

                  <div className={styles.crossmatchMetrics}>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Separation:</span>
                      <strong className="mono">{match.separationArcsec.toFixed(2)}″</strong>
                    </div>
                    {match.physical_separation_kpc && (
                      <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Physical Offset:</span>
                        <strong className="mono">{match.physical_separation_kpc} kpc</strong>
                      </div>
                    )}
                    {match.z !== undefined && match.z !== null && (
                      <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Redshift z:</span>
                        <strong className="mono">{match.z}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CARD 5: TRANSIENT ANNOTATOR */}
      <section className={`${styles.card} ${styles.cardAnnotate}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardBadge}>client.annotate</span>
            <h2 className={styles.cardTitle}>
              <Send size={18} className={styles.titleIcon} />
              Transient Classifier &amp; Annotator
            </h2>
          </div>
          <span className={styles.cardDesc}>
            Publish human vetting or ML model classifications back to the Lasair broker network.
          </span>
        </div>

        <form onSubmit={submitAnnotation} className={styles.annotateForm}>
          <div className={styles.inputRow}>
            <label className={styles.fieldGroup}>
              <span>Target Object ID</span>
              <input
                type="text"
                value={annObjId}
                onChange={(e) => setAnnObjId(e.target.value)}
                className={`${styles.textInput} mono`}
                required
              />
            </label>

            <label className={styles.fieldGroup}>
              <span>Topic Name</span>
              <input
                type="text"
                value={annTopic}
                onChange={(e) => setAnnTopic(e.target.value)}
                className={styles.textInput}
                required
              />
            </label>

            <label className={styles.fieldGroup}>
              <span>Classification</span>
              <select
                value={annClassification}
                onChange={(e) => setAnnClassification(e.target.value)}
                className={styles.selectInput}
              >
                <option value="SN Ia">💥 SN Ia (Thermonuclear)</option>
                <option value="SN II">⚡ SN II (Core Collapse)</option>
                <option value="TDE">🕳️ TDE (Tidal Disruption Event)</option>
                <option value="Kilonova">✨ Kilonova Candidate</option>
                <option value="CV Dwarf Nova">💫 CV Dwarf Nova</option>
                <option value="Microlensing">🔍 Microlensing Event</option>
              </select>
            </label>
          </div>

          <label className={styles.fieldGroup}>
            <span>Scientific Explanation &amp; Evidence</span>
            <textarea
              value={annExplanation}
              onChange={(e) => setAnnExplanation(e.target.value)}
              rows={2}
              className={styles.textareaInput}
              required
            />
          </label>

          <div className={styles.annotateSubmitRow}>
            <button
              type="submit"
              className={`${styles.primaryBtn} ${styles.glow}`}
              disabled={annLoading}
            >
              {annLoading ? 'Broadcasting...' : '🚀 Submit Annotation to Lasair'}
            </button>
          </div>
        </form>

        {annStatus && (
          <div className={`${styles.statusBox} ${annStatus.ok ? styles.success : styles.error}`}>
            {annStatus.msg}
          </div>
        )}
      </section>
    </div>
  );
}

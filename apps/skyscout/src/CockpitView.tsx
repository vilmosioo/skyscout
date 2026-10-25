import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  Telescope,
  Moon,
  Sun,
  Flame,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  MapPin,
  Crosshair,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  calculateAltAz,
  getCardinalDirection,
  formatCoordinates,
  degreesToHms,
  degreesToDms,
  type AltAzCoordinates,
} from '@skyscout/core';
import { getLasairObjectUrl, getLasairCutoutUrl } from '@skyscout/lasair-client';
import styles from './CockpitView.module.css';

export interface CockpitTarget {
  diaObjectId: string;
  designation: string;
  type: 'SN' | 'NT' | 'CV' | 'AGN';
  typeLabel: string;
  raDeg: number;
  decDeg: number;
  currentMag: number;
  peakMag: number;
  riseRate: string;
  trend: 'brightening' | 'fading' | 'plateau';
  urgency: string;
  constellation: string;
  hostGalaxy: string;
  hostRedshift: string;
  discoveryEpoch: string;
  snr: number;
  optimalTime: string;
}

export interface ObserverPreset {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elev: number;
}

const OBSERVER_PRESETS: ObserverPreset[] = [
  { id: 'london', name: 'London, UK (51.5°N, -0.1°E)', lat: 51.5074, lon: -0.1278, elev: 25 },
  { id: 'kittpeak', name: 'Tucson / Kitt Peak, US (31.9°N, -111.6°W)', lat: 31.9583, lon: -111.5967, elev: 2096 },
  { id: 'lapalma', name: 'Roque de los Muchachos, La Palma (28.7°N, -17.8°W)', lat: 28.7636, lon: -17.8814, elev: 2396 },
  { id: 'pachon', name: 'Rubin Site, Cerro Pachón, Chile (30.2°S, -70.7°W)', lat: -30.2444, lon: -70.7494, elev: 2663 },
  { id: 'sydney', name: 'Sydney, Australia (33.8°S, 151.2°E)', lat: -33.8688, lon: 151.2093, elev: 58 },
];

const DEFAULT_TARGETS: CockpitTarget[] = [
  {
    diaObjectId: '170587117485817951',
    designation: 'AT 2026bdf',
    type: 'SN',
    typeLabel: 'Type Ia Supernova',
    raDeg: 62.3908,
    decDeg: -48.5147,
    currentMag: 15.4,
    peakMag: 15.2,
    riseRate: '+0.38 mag/day',
    trend: 'brightening',
    urgency: 'Rising rapidly • Best window now',
    constellation: 'Horologium / Eridanus',
    hostGalaxy: 'ESO 201-G022',
    hostRedshift: 'z = 0.021',
    discoveryEpoch: 'MJD 61235.42 (Today)',
    snr: 44.8,
    optimalTime: '01:15 AM',
  },
  {
    diaObjectId: '170019695992242795',
    designation: 'AT 2026aux',
    type: 'SN',
    typeLabel: 'Type II-P Supernova',
    raDeg: 52.8238,
    decDeg: -29.6916,
    currentMag: 16.1,
    peakMag: 15.9,
    riseRate: '-0.04 mag/day',
    trend: 'plateau',
    urgency: 'Photometric plateau • Prime target',
    constellation: 'Fornax',
    hostGalaxy: 'NGC 1365 (Fornax Cluster)',
    hostRedshift: 'z = 0.0054',
    discoveryEpoch: 'MJD 61234.88',
    snr: 32.1,
    optimalTime: '00:30 AM',
  },
  {
    diaObjectId: '313853497709690883',
    designation: 'Rubin-CV-2026-09',
    type: 'CV',
    typeLabel: 'Dwarf Nova Outburst',
    raDeg: 61.9080,
    decDeg: -47.0429,
    currentMag: 14.8,
    peakMag: 14.7,
    riseRate: '+1.85 mag/day',
    trend: 'brightening',
    urgency: 'Extreme outburst! Rapid followup needed',
    constellation: 'Horologium',
    hostGalaxy: 'Galactic Plane Star',
    hostRedshift: 'z = 0.000',
    discoveryEpoch: 'MJD 61235.40 (4h ago)',
    snr: 68.4,
    optimalTime: '01:05 AM',
  },
  {
    diaObjectId: '170644275288604684',
    designation: 'AT 2026cdk',
    type: 'NT',
    typeLabel: 'Tidal Disruption Event (TDE)',
    raDeg: 62.7772,
    decDeg: -49.3932,
    currentMag: 17.2,
    peakMag: 16.9,
    riseRate: '+0.12 mag/day',
    trend: 'brightening',
    urgency: 'Nuclear flare • Deep exposure required',
    constellation: 'Reticulum',
    hostGalaxy: '2MASX J04110650-4923351',
    hostRedshift: 'z = 0.068',
    discoveryEpoch: 'MJD 61235.38',
    snr: 18.2,
    optimalTime: '01:40 AM',
  },
  {
    diaObjectId: '170019696008495213',
    designation: 'AT 2026aqe',
    type: 'SN',
    typeLabel: 'Type Ib/c Core Collapse',
    raDeg: 53.1698,
    decDeg: -29.1857,
    currentMag: 16.8,
    peakMag: 16.5,
    riseRate: '-0.15 mag/day',
    trend: 'fading',
    urgency: 'Post-maximum fading • Capture tonight',
    constellation: 'Fornax',
    hostGalaxy: 'MCG -05-09-011',
    hostRedshift: 'z = 0.018',
    discoveryEpoch: 'MJD 61233.15',
    snr: 22.5,
    optimalTime: '23:45 PM',
  },
  {
    diaObjectId: '170019695454847192',
    designation: 'Rubin-AGN-042',
    type: 'AGN',
    typeLabel: 'Seyfert / Blazar Flare',
    raDeg: 53.0906,
    decDeg: -29.6519,
    currentMag: 17.5,
    peakMag: 17.1,
    riseRate: '+0.22 mag/day',
    trend: 'brightening',
    urgency: 'Active galactic flare',
    constellation: 'Fornax',
    hostGalaxy: 'WISEA J033221.72-293906.9',
    hostRedshift: 'z = 0.124',
    discoveryEpoch: 'MJD 61235.12',
    snr: 15.3,
    optimalTime: '00:15 AM',
  },
  {
    diaObjectId: '313985347881009292',
    designation: 'AT 2026cnm',
    type: 'SN',
    typeLabel: 'Superluminous Supernova (SLSN)',
    raDeg: 64.0262,
    decDeg: -46.7823,
    currentMag: 17.9,
    peakMag: 17.8,
    riseRate: '+0.05 mag/day',
    trend: 'plateau',
    urgency: 'Rare SLSN candidate • Long plateau',
    constellation: 'Horologium',
    hostGalaxy: 'Faint dwarf host',
    hostRedshift: 'z = 0.285',
    discoveryEpoch: 'MJD 61234.90',
    snr: 12.8,
    optimalTime: '01:50 AM',
  },
  {
    diaObjectId: '170019696269590551',
    designation: 'AT 2026bxa',
    type: 'SN',
    typeLabel: 'Type Ia-91T-like',
    raDeg: 62.1068,
    decDeg: -48.6761,
    currentMag: 15.9,
    peakMag: 15.8,
    riseRate: '+0.30 mag/day',
    trend: 'brightening',
    urgency: 'Over-luminous Type Ia • High priority',
    constellation: 'Horologium',
    hostGalaxy: 'ESO 201-G018',
    hostRedshift: 'z = 0.024',
    discoveryEpoch: 'MJD 61235.42',
    snr: 38.6,
    optimalTime: '01:10 AM',
  },
];

interface PointData {
  time: Date;
  hourLabel: string;
  alt: number;
  az: number;
  airmass: number;
  isDark: boolean;
  isObservable: boolean;
}

interface NightArcResult {
  points: PointData[];
  peakAlt: number;
  hoursAboveCutoff: number;
  bestWindowStart: Date | null;
  bestWindowEnd: Date | null;
}

interface CockpitViewProps {
  isDemoMode: boolean;
}

export function CockpitView({ isDemoMode }: CockpitViewProps) {
  // Observer Location State
  const [selectedPreset, setSelectedPreset] = useState<string>('london');
  const [currentLocation, setCurrentLocation] = useState<ObserverPreset>(OBSERVER_PRESETS[0]);

  // Controls & Filter State
  const [minAltitudeCutoff, setMinAltitudeCutoff] = useState<number>(25);
  const [maxMagnitudeLimit, setMaxMagnitudeLimit] = useState<number>(18.0);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'SN' | 'NT' | 'CV' | 'AGN'>('ALL');
  const [observableOnly, setObservableOnly] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'altitude' | 'brightness' | 'window' | 'urgency'>('altitude');

  // Selected Target ID
  const [selectedTargetId, setSelectedTargetId] = useState<string>('170587117485817951');

  // Stamp Colormap State
  const [colormap, setColormap] = useState<'invert' | 'plasma' | 'gray'>('invert');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Canvas Refs
  const nightArcRef = useRef<HTMLCanvasElement | null>(null);
  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scienceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Compute 12-hour altitude profile for a target
  const computeNightArc = (raDeg: number, decDeg: number): NightArcResult => {
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);

    const points: PointData[] = [];
    let peakAlt = -90;
    let hoursAboveCutoff = 0;
    let bestWindowStart: Date | null = null;
    let bestWindowEnd: Date | null = null;

    for (let i = 0; i <= 24; i++) {
      const t = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
      const res: AltAzCoordinates = calculateAltAz(
        raDeg,
        decDeg,
        currentLocation.lat,
        currentLocation.lon,
        t
      );

      if (res.altitude > peakAlt) peakAlt = res.altitude;

      const isDark = i >= 3 && i <= 21; // ~19:30 to 04:30
      const isObservable = res.altitude >= minAltitudeCutoff && isDark;

      if (isObservable) {
        hoursAboveCutoff += 0.5;
        if (!bestWindowStart) bestWindowStart = t;
        bestWindowEnd = t;
      }

      points.push({
        time: t,
        hourLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        alt: Math.round(res.altitude * 10) / 10,
        az: Math.round(res.azimuth),
        airmass: Math.round(res.airmass * 10) / 10,
        isDark,
        isObservable,
      });
    }

    return {
      points,
      peakAlt: Math.round(peakAlt * 10) / 10,
      hoursAboveCutoff,
      bestWindowStart,
      bestWindowEnd,
    };
  };

  // Filtered and sorted target list
  const filteredTargets = useMemo(() => {
    const list = DEFAULT_TARGETS.filter((t) => {
      if (selectedCategory !== 'ALL' && t.type !== selectedCategory) return false;
      if (t.currentMag > maxMagnitudeLimit) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          t.designation.toLowerCase().includes(q) ||
          t.hostGalaxy.toLowerCase().includes(q) ||
          t.diaObjectId.includes(q) ||
          t.constellation.toLowerCase().includes(q);
        if (!match) return false;
      }

      const arc = computeNightArc(t.raDeg, t.decDeg);
      if (observableOnly && arc.hoursAboveCutoff <= 0) return false;
      return true;
    });

    list.sort((a, b) => {
      const arcA = computeNightArc(a.raDeg, a.decDeg);
      const arcB = computeNightArc(b.raDeg, b.decDeg);
      if (sortBy === 'altitude') return arcB.peakAlt - arcA.peakAlt;
      if (sortBy === 'brightness') return a.currentMag - b.currentMag;
      if (sortBy === 'window') return arcB.hoursAboveCutoff - arcA.hoursAboveCutoff;
      if (sortBy === 'urgency') return a.currentMag - b.currentMag;
      return 0;
    });

    return list;
  }, [
    selectedCategory,
    maxMagnitudeLimit,
    searchQuery,
    observableOnly,
    sortBy,
    currentLocation,
    minAltitudeCutoff,
  ]);

  // Active target
  const activeTarget = useMemo(() => {
    return (
      filteredTargets.find((t) => t.diaObjectId === selectedTargetId) ||
      filteredTargets[0] ||
      DEFAULT_TARGETS[0]
    );
  }, [filteredTargets, selectedTargetId]);

  // Active target night arc
  const activeNightArc = useMemo(() => {
    if (!activeTarget) return null;
    return computeNightArc(activeTarget.raDeg, activeTarget.decDeg);
  }, [activeTarget, currentLocation, minAltitudeCutoff]);

  // Current real-time position of active target
  const activeCurrentAltAz = useMemo(() => {
    if (!activeTarget) return { altitude: 0, azimuth: 0, airmass: 1 };
    return calculateAltAz(
      activeTarget.raDeg,
      activeTarget.decDeg,
      currentLocation.lat,
      currentLocation.lon,
      new Date()
    );
  }, [activeTarget, currentLocation]);

  // Draw Night Arc Chart on Canvas
  useEffect(() => {
    const canvas = nightArcRef.current;
    if (!canvas || !activeNightArc) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const paddingLeft = 35;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 25;
    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    const altMin = -30;
    const altMax = 90;
    const points = activeNightArc.points;

    const getX = (index: number) => paddingLeft + (index / (points.length - 1)) * chartW;
    const getY = (alt: number) =>
      paddingTop + chartH - ((alt - altMin) / (altMax - altMin)) * chartH;

    // 1. Draw Astronomical Darkness Zone (Points 3 to 21 ~ 19:30 to 04:30)
    const darkX1 = getX(3);
    const darkX2 = getX(21);
    ctx.fillStyle = 'rgba(10, 18, 38, 0.7)';
    ctx.fillRect(darkX1, paddingTop, darkX2 - darkX1, chartH);

    ctx.fillStyle = 'rgba(74, 107, 175, 0.45)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASTRONOMICAL DARKNESS', (darkX1 + darkX2) / 2, paddingTop + 14);

    // 2. Draw Horizontal Grid Lines
    const gridLevels = [0, minAltitudeCutoff, 45, 70];
    gridLevels.forEach((altVal) => {
      const yPos = getY(altVal);
      ctx.beginPath();
      ctx.strokeStyle =
        altVal === minAltitudeCutoff ? 'rgba(244, 63, 94, 0.75)' : 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = altVal === minAltitudeCutoff ? 1.5 : 1;
      if (altVal === minAltitudeCutoff) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.moveTo(paddingLeft, yPos);
      ctx.lineTo(w - paddingRight, yPos);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = altVal === minAltitudeCutoff ? '#fb7185' : '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${altVal}°`, paddingLeft - 5, yPos + 3);
    });

    // 3. Draw Shaded Observable Window (Darkness & Above Cutoff)
    ctx.beginPath();
    let started = false;
    let firstX = 0;
    let lastX = 0;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      if (pt.isObservable) {
        const px = getX(i);
        const py = getY(pt.alt);
        if (!started) {
          ctx.moveTo(px, getY(minAltitudeCutoff));
          firstX = px;
          started = true;
        }
        ctx.lineTo(px, py);
        lastX = px;
      }
    }
    if (started) {
      ctx.lineTo(lastX, getY(minAltitudeCutoff));
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.fill();
    }

    // 4. Draw Altitude Curve
    ctx.beginPath();
    points.forEach((pt, idx) => {
      const px = getX(idx);
      const py = getY(pt.alt);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 5. Peak Altitude Transit Marker
    let peakPt = points[0];
    let peakIdx = 0;
    points.forEach((pt, idx) => {
      if (pt.alt > peakPt.alt) {
        peakPt = pt;
        peakIdx = idx;
      }
    });

    if (peakPt.alt > -10) {
      const px = getX(peakIdx);
      const py = getY(peakPt.alt);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Transit: ${peakPt.alt}°`, px, py - 8);
    }
  }, [activeNightArc, minAltitudeCutoff]);

  // Draw Triplet CCD Stamps on Canvas
  useEffect(() => {
    if (!activeTarget) return;
    const size = 140;
    const center = size / 2;

    const seed = String(activeTarget.diaObjectId)
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 42);
    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const render = (canvas: HTMLCanvasElement | null, type: 'template' | 'science' | 'diff') => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgData = ctx.createImageData(size, size);
      const data = imgData.data;

      const hostX = center - 8;
      const hostY = center + 6;
      const hostRadius = 26;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const noise = (pseudoRandom(x * 19 + y * 23) - 0.5) * 16;
          let val = 20 + noise;

          if (type === 'template' || type === 'science') {
            const dx = (x - hostX) / 1.3;
            const dy = (y - hostY) / 0.85;
            const dist = Math.hypot(dx, dy);
            if (dist < hostRadius * 2) {
              val += Math.exp(-dist / (hostRadius * 0.45)) * 115;
            }
            const dStar = Math.hypot(x - (center + 35), y - (center - 25));
            val += Math.exp(-(dStar * dStar) / 8) * 90;
          }

          if (type === 'science' || type === 'diff') {
            const dt = Math.hypot(x - center, y - center);
            val += Math.exp(-(dt * dt) / (2 * 2.6 * 2.6)) * 210;
          }

          val = Math.max(0, Math.min(255, val));

          let r = val,
            g = val,
            b = val;
          if (colormap === 'invert') {
            const inv = 255 - val;
            r = inv;
            g = inv;
            b = inv;
          } else if (colormap === 'plasma') {
            const norm = val / 255;
            r = Math.min(255, Math.floor(norm * 255 * 1.2));
            g = Math.min(255, Math.floor(Math.sin(norm * Math.PI) * 220));
            b = Math.min(255, Math.floor((1 - norm) * 200 + norm * 80));
          }

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Astrometric Reticle Crosshairs
      ctx.strokeStyle = colormap === 'invert' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1;
      const retSize = 10;
      const gap = 3;

      ctx.beginPath();
      ctx.moveTo(center, center - gap);
      ctx.lineTo(center, center - gap - retSize);
      ctx.moveTo(center, center + gap);
      ctx.lineTo(center, center + gap + retSize);
      ctx.moveTo(center - gap, center);
      ctx.lineTo(center - gap - retSize, center);
      ctx.moveTo(center + gap, center);
      ctx.lineTo(center + gap + retSize, center);
      ctx.stroke();
    };

    render(templateCanvasRef.current, 'template');
    render(scienceCanvasRef.current, 'science');
    render(diffCanvasRef.current, 'diff');
  }, [activeTarget, colormap]);

  // Copy coordinates for ASIAIR / N.I.N.A.
  const copyCoordinates = (target: CockpitTarget) => {
    const hms = degreesToHms(target.raDeg);
    const dms = degreesToDms(target.decDeg);
    const coordStr = `${hms.hours}h ${hms.minutes}m ${hms.seconds.toFixed(1)}s, ${dms.sign}${dms.degrees}° ${dms.minutes}' ${dms.seconds.toFixed(1)}"`;
    navigator.clipboard.writeText(coordStr).then(() => {
      triggerToast(`Copied ${coordStr} to clipboard for N.I.N.A. / ASIAIR!`);
    });
  };

  // Export CSV Observing Plan
  const downloadCsvPlan = () => {
    if (filteredTargets.length === 0) {
      triggerToast('No targets to export with current filters.');
      return;
    }

    let csv =
      'Target_Name,Type,RA_deg,Dec_deg,Mag,Peak_Alt,Dark_Window_Hours,Optimal_Time,Host_Galaxy\n';
    filteredTargets.forEach((t) => {
      const arc = computeNightArc(t.raDeg, t.decDeg);
      csv += `"${t.designation}","${t.type}",${t.raDeg},${t.decDeg},${t.currentMag},${arc.peakAlt},${arc.hoursAboveCutoff},"${t.optimalTime}","${t.hostGalaxy}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rubin_Transient_Plan_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${filteredTargets.length} targets to CSV observing plan!`);
  };

  const openAladin = (ra: number, dec: number) => {
    const url = `https://aladin.cds.unistra.fr/AladinLite/?target=${ra}%20${dec}&fov=0.15&survey=P%2FDSS2%2Fcolor`;
    window.open(url, '_blank');
  };

  // Geolocation Request
  const requestGps = () => {
    if (!navigator.geolocation) {
      triggerToast('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const custom: ObserverPreset = {
          id: 'custom_gps',
          name: `GPS Location (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E)`,
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lon: Math.round(pos.coords.longitude * 10000) / 10000,
          elev: 50,
        };
        setCurrentLocation(custom);
        setSelectedPreset('custom_gps');
        triggerToast(`Location updated to GPS (${custom.lat}°, ${custom.lon}°)`);
      },
      () => {
        triggerToast('Could not access device GPS.');
      }
    );
  };

  const handlePresetSelect = (id: string) => {
    setSelectedPreset(id);
    const found = OBSERVER_PRESETS.find((p) => p.id === id);
    if (found) setCurrentLocation(found);
  };

  const activeHms = activeTarget ? degreesToHms(activeTarget.raDeg) : { hours: 0, minutes: 0, seconds: 0 };
  const activeDms = activeTarget ? degreesToDms(activeTarget.decDeg) : { sign: '+', degrees: 0, minutes: 0, seconds: 0 };
  const activeCoordStrings = activeTarget
    ? formatCoordinates(activeTarget.raDeg, activeTarget.decDeg, 4)
    : { raStr: '0.0000', decStr: '0.0000' };

  return (
    <div className={styles.cockpitContainer}>
      {/* 1. Environment & Sky Status Header */}
      <section className={styles.envHeader}>
        <div className={styles.envLeft}>
          <div className={styles.cockpitIconGlow}>
            <Compass size={20} />
          </div>
          <div>
            <div className={styles.cockpitTitle}>
              <span>Rubin Transient Scout</span>
              <span className={styles.livePill}>
                <span className={styles.pulseDot} />
                Rubin Stream Live
              </span>
            </div>
            <p className={styles.cockpitSubtitle}>
              Observatory Cockpit &amp; Nightly Target Dispatch
            </p>
          </div>
        </div>

        <div className={styles.envRight}>
          {/* Location Picker */}
          <div className={styles.infoBadge}>
            <MapPin size={14} className="text-blue-400" />
            <div>
              <div className={styles.infoBadgeLabel}>Observer Location</div>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className={styles.locationSelect}
                >
                  {OBSERVER_PRESETS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name}
                    </option>
                  ))}
                  {selectedPreset === 'custom_gps' && (
                    <option value="custom_gps" className="bg-slate-900 text-white">
                      {currentLocation.name}
                    </option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={requestGps}
                  title="Acquire device GPS"
                  className={styles.gpsBtn}
                >
                  <MapPin size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Moon Phase Snapshot */}
          <div className={styles.infoBadge}>
            <Moon size={14} className="text-amber-300" />
            <div>
              <div className={styles.infoBadgeLabel}>Moon Phase</div>
              <div className={styles.infoBadgeVal}>Waxing Gibbous 74%</div>
            </div>
          </div>

          {/* Astronomical Darkness */}
          <div className={styles.infoBadge}>
            <Clock size={14} className="text-indigo-400" />
            <div>
              <div className={styles.infoBadgeLabel}>Astro Darkness</div>
              <div className={styles.infoBadgeVal}>19:45 – 05:15 (9.5h)</div>
            </div>
          </div>

          {/* Observable Target Count Badge */}
          <div className={styles.targetCountBadge}>
            <span>{filteredTargets.length}</span>
            <span className="font-normal text-xs text-blue-300">Hits Tonight</span>
          </div>
        </div>
      </section>

      {/* 2. Controls & Filter Bar */}
      <section className={styles.controlBar}>
        <div className={styles.controlGroup}>
          {/* Tree / Roof Horizon Cutoff */}
          <div className={styles.sliderGroup}>
            <label htmlFor="minAltSlider" className={styles.sliderLabel}>
              <span>🌲 Tree/Roof Cutoff:</span>
              <span className={styles.sliderValBlue}>{minAltitudeCutoff}°</span>
            </label>
            <input
              id="minAltSlider"
              type="range"
              min={10}
              max={60}
              step={5}
              value={minAltitudeCutoff}
              onChange={(e) => setMinAltitudeCutoff(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
            />
          </div>

          {/* Rig Magnitude Limit */}
          <div className={styles.sliderGroup}>
            <label htmlFor="maxMagSlider" className={styles.sliderLabel}>
              <span>🔭 Rig Limit:</span>
              <span className={styles.sliderValGreen}>&le; {maxMagnitudeLimit.toFixed(1)} mag</span>
            </label>
            <input
              id="maxMagSlider"
              type="range"
              min={13.0}
              max={20.0}
              step={0.5}
              value={maxMagnitudeLimit}
              onChange={(e) => setMaxMagnitudeLimit(parseFloat(e.target.value))}
              className={styles.sliderInput}
            />
          </div>

          {/* Observable Tonight Switch */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={observableOnly}
              onChange={(e) => setObservableOnly(e.target.checked)}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span>Observable Tonight Only</span>
          </label>
        </div>

        <div className={styles.controlGroup}>
          {/* Category Filter Pills */}
          <div className={styles.filterPills}>
            {(['ALL', 'SN', 'CV', 'NT'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`${styles.filterPill} ${selectedCategory === cat ? styles.filterPillActive : ''}`}
              >
                {cat === 'ALL' && 'All'}
                {cat === 'SN' && '💥 Supernovae'}
                {cat === 'CV' && '⚡ Cataclysmic (CV)'}
                {cat === 'NT' && '🕳️ Nuclear (TDE)'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search target, host, or RA/Dec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="altitude">Sort: Peak Altitude</option>
            <option value="brightness">Sort: Brightness (Mag)</option>
            <option value="window">Sort: Dark Window</option>
            <option value="urgency">Sort: Rising Urgency</option>
          </select>
        </div>
      </section>

      {/* 3. Main Two-Column Workspace */}
      <main className={styles.workspace}>
        {/* Left Column: Tonight's Hits Feed */}
        <section className={styles.feedSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span>Tonight's Observable Hits</span>
              <span className={styles.sectionCount}>({filteredTargets.length} visible)</span>
            </div>
            <button
              type="button"
              onClick={downloadCsvPlan}
              className={styles.exportTextBtn}
              title="Download observing plan for N.I.N.A. / ASIAIR"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>

          {filteredTargets.length === 0 ? (
            <div className={styles.emptyState}>
              <Telescope size={36} className="text-slate-600" />
              <div className="font-semibold text-slate-200">No Observable Targets Found</div>
              <p className="text-xs max-w-xs text-slate-400">
                No alerts clear your altitude cutoff of{' '}
                <strong className="text-blue-400">{minAltitudeCutoff}°</strong> with brightness{' '}
                <strong className="text-emerald-400">&le; {maxMagnitudeLimit.toFixed(1)} mag</strong>.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setMinAltitudeCutoff(15)}
                  className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-medium"
                >
                  Lower Cutoff to 15°
                </button>
                <button
                  type="button"
                  onClick={() => setMaxMagnitudeLimit(19.0)}
                  className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium"
                >
                  Extend Limit to 19.0
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.targetList}>
              {filteredTargets.map((t) => {
                const isSelected = t.diaObjectId === activeTarget?.diaObjectId;
                const arc = computeNightArc(t.raDeg, t.decDeg);
                const altAz = calculateAltAz(
                  t.raDeg,
                  t.decDeg,
                  currentLocation.lat,
                  currentLocation.lon,
                  new Date()
                );
                const cardinal = getCardinalDirection(altAz.azimuth);

                let badgeStyle = styles.badgeSN;
                if (t.type === 'CV') badgeStyle = styles.badgeCV;
                if (t.type === 'NT') badgeStyle = styles.badgeNT;
                if (t.type === 'AGN') badgeStyle = styles.badgeAGN;

                const trendIcon = t.trend === 'brightening' ? '↗' : t.trend === 'fading' ? '↘' : '⏺';

                return (
                  <div
                    key={t.diaObjectId}
                    onClick={() => setSelectedTargetId(t.diaObjectId)}
                    className={`${styles.targetCard} ${isSelected ? styles.targetCardActive : ''}`}
                  >
                    <div className={styles.cardTopRow}>
                      <div className="flex items-center gap-2">
                        <span className={styles.cardDesignation}>{t.designation}</span>
                        <span className={badgeStyle}>{t.type}</span>
                      </div>
                      <div
                        className={`${styles.cardMag} ${t.currentMag < 16 ? styles.magBright : ''}`}
                      >
                        <span>{t.currentMag.toFixed(1)}</span>
                        <span className="text-xs text-slate-400 font-normal">mag</span>
                        <span
                          className={`font-bold text-xs ${t.trend === 'brightening' ? 'text-rose-400' : 'text-slate-400'}`}
                        >
                          {trendIcon}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardGrid}>
                      <div>
                        <span className="text-slate-400 text-[11px]">Now: </span>
                        <span
                          className={`font-semibold font-mono ${altAz.altitude >= minAltitudeCutoff ? 'text-emerald-400' : 'text-slate-400'}`}
                        >
                          {Math.round(altAz.altitude)}° Alt ({cardinal})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px]">Peak: </span>
                        <span className="font-semibold font-mono text-blue-300">
                          {arc.peakAlt}° Alt
                        </span>
                      </div>
                      <div className="col-span-2 text-slate-400 text-[11px] flex items-center justify-between">
                        <span>🌌 {t.constellation}</span>
                        <span>
                          Dark Window:{' '}
                          <strong className="text-blue-400 font-semibold">
                            {arc.hoursAboveCutoff}h
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardBottomRow}>
                      <span className="flex items-center">
                        <span
                          className={`${styles.urgencyDot} ${t.urgency.includes('Rising') ? styles.urgencyRising : styles.urgencyNormal}`}
                        />
                        {t.urgency}
                      </span>
                      <span className="text-blue-400 font-semibold hover:underline">Inspect ↗</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Target Detail & Mission Control */}
        <section className={styles.detailSection}>
          {activeTarget && (
            <>
              {/* Header */}
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.detailTitle}>
                    <span>{activeTarget.designation}</span>
                    <span
                      className={
                        activeTarget.type === 'CV'
                          ? styles.badgeCV
                          : activeTarget.type === 'NT'
                            ? styles.badgeNT
                            : styles.badgeSN
                      }
                    >
                      {activeTarget.typeLabel}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {activeTarget.diaObjectId}
                    </span>
                  </div>
                  <div className={styles.detailMeta}>
                    <span>
                      Host: <strong className="text-slate-200">{activeTarget.hostGalaxy}</strong> (
                      {activeTarget.hostRedshift})
                    </span>
                    <span>•</span>
                    <span>
                      Constellation:{' '}
                      <strong className="text-slate-200">{activeTarget.constellation}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      SNR:{' '}
                      <strong className="text-emerald-400 font-mono">{activeTarget.snr}</strong>
                    </span>
                  </div>
                </div>

                <a
                  href={getLasairObjectUrl(activeTarget.diaObjectId)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.extBtn}
                >
                  <span>Lasair Portal</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Coordinates Box */}
              <div className={styles.coordsBox}>
                <div className={styles.coordsGroup}>
                  <div className={styles.coordField}>
                    <span className={styles.coordFieldLabel}>Right Ascension (J2000)</span>
                    <span className={styles.coordFieldVal}>
                      {activeHms.hours}h {activeHms.minutes}m {activeHms.seconds.toFixed(1)}s{' '}
                      <span className="text-slate-500 font-normal">({activeCoordStrings.raStr}°)</span>
                    </span>
                  </div>
                  <div className={styles.coordField}>
                    <span className={styles.coordFieldLabel}>Declination (J2000)</span>
                    <span className={styles.coordFieldVal}>
                      {activeDms.sign}
                      {activeDms.degrees}° {activeDms.minutes}' {activeDms.seconds.toFixed(1)}"
                      <span className="text-slate-500 font-normal">
                        ({activeCoordStrings.decStr}°)
                      </span>
                    </span>
                  </div>
                  <div className={styles.coordField}>
                    <span className={styles.coordFieldLabel}>Current Observer Altitude</span>
                    <span className="text-sm font-bold font-mono text-blue-400">
                      {Math.round(activeCurrentAltAz.altitude)}° Alt (
                      {getCardinalDirection(activeCurrentAltAz.azimuth)}){' '}
                      <span className="text-slate-500 font-normal">
                        X={activeCurrentAltAz.airmass.toFixed(1)}
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyCoordinates(activeTarget)}
                  className={styles.copyBtn}
                >
                  <Copy size={13} />
                  <span>Copy for ASIAIR / N.I.N.A.</span>
                </button>
              </div>

              {/* The "Night Arc" Canvas Timeline */}
              <div className={styles.chartContainer}>
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span>📈 12-Hour Night Altitude Arc (Dusk to Dawn)</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      • {currentLocation.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500" />
                      Observable Window
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-rose-500" /> Cutoff ({minAltitudeCutoff}°)
                    </span>
                  </div>
                </div>

                <div className={styles.canvasWrapper}>
                  <canvas ref={nightArcRef} width={700} height={220} />
                </div>

                <div className={styles.timeTicks}>
                  <span>18:00 (Sunset)</span>
                  <span>21:00</span>
                  <span>00:00 (Midnight)</span>
                  <span>03:00</span>
                  <span>06:00 (Dawn)</span>
                </div>
              </div>

              {/* CCD Difference Imaging Triplet */}
              <div className={styles.stampsSection}>
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <Layers size={14} className="text-blue-400" />
                    <span>Difference Image Analysis (DIA) Cutouts</span>
                    <span className="text-slate-400 text-[11px] font-normal">
                      (Synchronized Triplet)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Colormap:</span>
                    <select
                      value={colormap}
                      onChange={(e) => setColormap(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="invert">Invert Grayscale (Plate)</option>
                      <option value="plasma">Plasma False-Color</option>
                      <option value="gray">Direct Grayscale</option>
                    </select>
                  </div>
                </div>

                <div className={styles.stampsGrid}>
                  {/* Template */}
                  <div className={styles.stampCard}>
                    <div className="flex justify-between w-full text-[11px]">
                      <span className="font-bold text-slate-300">Template</span>
                      <span className="text-slate-500 text-[10px]">Reference</span>
                    </div>
                    <canvas
                      ref={templateCanvasRef}
                      width={140}
                      height={140}
                      className={styles.stampCanvas}
                    />
                    <span className="text-[10px] text-slate-400">Pre-outburst host galaxy</span>
                  </div>

                  {/* Science */}
                  <div className={styles.stampCard}>
                    <div className="flex justify-between w-full text-[11px]">
                      <span className="font-bold text-blue-400">Science</span>
                      <span className="text-slate-500 text-[10px]">Observation</span>
                    </div>
                    <canvas
                      ref={scienceCanvasRef}
                      width={140}
                      height={140}
                      className={styles.stampCanvas}
                    />
                    <span className="text-[10px] text-slate-400">New visit + transient</span>
                  </div>

                  {/* Difference */}
                  <div className={`${styles.stampCard} ${styles.stampCardHighlight}`}>
                    <div className="flex justify-between w-full text-[11px]">
                      <span className="font-bold text-rose-400">Difference (Diff)</span>
                      <span className="text-rose-400/70 text-[10px]">Science − Temp</span>
                    </div>
                    <canvas
                      ref={diffCanvasRef}
                      width={140}
                      height={140}
                      className={styles.stampCanvas}
                    />
                    <span className="text-[10px] text-rose-300">Isolated residual transient</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className={styles.actionsFooter}>
                <div className="text-xs text-slate-400">
                  Optimal Imaging Window:{' '}
                  <strong className="text-emerald-400 font-semibold">
                    {activeNightArc && activeNightArc.hoursAboveCutoff > 0
                      ? `${activeNightArc.bestWindowStart ? activeNightArc.bestWindowStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '23:00'} to ${activeNightArc.bestWindowEnd ? activeNightArc.bestWindowEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '03:30'} (${activeNightArc.hoursAboveCutoff} hrs)`
                      : 'Sub-horizon tonight'}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAladin(activeTarget.raDeg, activeTarget.decDeg)}
                    className={styles.extBtn}
                  >
                    <span>Open in Aladin Sky Map</span>
                    <ExternalLink size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={downloadCsvPlan}
                    className={styles.actionBtnPrimary}
                  >
                    <Download size={14} />
                    <span>Export Observing Plan (.CSV)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

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

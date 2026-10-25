import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Telescope,
  LayoutGrid,
  SlidersHorizontal,
  Compass,
  Code2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Radio,
} from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onOpenJsonModal: () => void;
}

export function Navbar({ isDemoMode, setIsDemoMode, onOpenJsonModal }: NavbarProps) {
  const [location] = useLocation();

  const isCardsActive = location === '/' || location === '/cards';
  const isCockpitActive = location === '/cockpit';
  const isConsoleActive = location === '/console';

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <Link href="/" className={styles.navbarBrand}>
          <div className={styles.brandLogoGlow}>
            <Telescope className={styles.brandIconSvg} />
          </div>
          <div>
            <div className={styles.brandTitleRow}>
              <span className={styles.brandName}>SkyScout</span>
              <span className={styles.brandTag}>Rubin Alerts</span>
            </div>
            <p className={styles.brandTagline}>Time-Domain Astronomical Alert Scout</p>
          </div>
        </Link>

        {/* Primary Navigation Tabs */}
        <nav className={styles.navLinks}>
          <Link
            href="/"
            className={`${styles.navTab} ${isCardsActive ? styles.navTabActive : ''}`}
          >
            <LayoutGrid className={styles.tabIcon} size={16} />
            <span>Discovery Feed</span>
          </Link>
          <Link
            href="/cockpit"
            className={`${styles.navTab} ${isCockpitActive ? styles.navTabActive : ''}`}
          >
            <Compass className={styles.tabIcon} size={16} />
            <span>Nightly Cockpit</span>
          </Link>
          <Link
            href="/console"
            className={`${styles.navTab} ${isConsoleActive ? styles.navTabActive : ''}`}
          >
            <SlidersHorizontal className={styles.tabIcon} size={16} />
            <span>Scout Console</span>
          </Link>
        </nav>
      </div>

      <div className={styles.navbarRight}>
        {/* Mode Switcher */}
        <div className={styles.modeToggleGroup}>
          <button
            className={`${styles.modeBtn} ${isDemoMode ? styles.modeBtnActiveDemo : ''}`}
            onClick={() => setIsDemoMode(true)}
            title="Explore Rubin transient alerts with simulated broker telemetry"
          >
            <Sparkles size={14} />
            <span>Demo Mode</span>
          </button>
          <button
            className={`${styles.modeBtn} ${!isDemoMode ? styles.modeBtnActiveLive : ''}`}
            onClick={() => setIsDemoMode(false)}
            title="Connect live to official Lasair LSST broker API"
          >
            <Radio size={14} className={!isDemoMode ? styles.pulseIcon : ''} />
            <span>Live API</span>
          </button>
        </div>

        {/* JSON Inspector */}
        <button
          className={styles.navActionBtn}
          onClick={onOpenJsonModal}
          title="Inspect lossless raw response JSON"
        >
          <Code2 size={16} />
          <span>Raw JSON</span>
        </button>

        {/* GitHub Issues */}
        <a
          href="https://github.com/vilmosioo/skyscout/issues"
          target="_blank"
          rel="noreferrer"
          className={`${styles.navActionBtn} ${styles.githubBtn}`}
          title="Feedback, issues, and feature requests on GitHub"
        >
          <MessageSquare size={16} />
          <span>Feedback</span>
          <ExternalLink size={12} className={styles.extIcon} />
        </a>
      </div>
    </header>
  );
}

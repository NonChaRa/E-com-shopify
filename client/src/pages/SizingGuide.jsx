import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../hooks/useInView';
import './SizingGuide.css';

const FINGERS = [
  { key: 'thumb',  label: 'Thumb'  },
  { key: 'index',  label: 'Index'  },
  { key: 'middle', label: 'Middle' },
  { key: 'ring',   label: 'Ring'   },
  { key: 'pinky',  label: 'Pinky'  },
];

// CM measurements per size (SS excluded per brand spec)
const SIZES = [
  { name: 'S',  label: 'Small',       thumb: 1.2, index: 0.8, middle: 0.9, ring: 0.8, pinky: 0.6 },
  { name: 'M',  label: 'Medium',      thumb: 1.3, index: 0.9, middle: 1.0, ring: 0.9, pinky: 0.7 },
  { name: 'L',  label: 'Large',       thumb: 1.4, index: 1.0, middle: 1.1, ring: 1.0, pinky: 0.8 },
  { name: 'XL', label: 'Extra Large', thumb: 1.5, index: 1.1, middle: 1.2, ring: 1.1, pinky: 0.9 },
];

// Average absolute deviation per filled finger — smaller = better fit
// Iterate large→small so ties resolve to the larger (more comfortable) size
function getRecommendation(measurements) {
  const filled = FINGERS.filter(
    f => measurements[f.key] !== '' && !isNaN(parseFloat(measurements[f.key]))
  );
  if (filled.length === 0) return null;

  let best = null;
  let bestScore = Infinity;

  for (let i = SIZES.length - 1; i >= 0; i--) {
    const size = SIZES[i];
    const score =
      filled.reduce((sum, f) => sum + Math.abs(parseFloat(measurements[f.key]) - size[f.key]), 0) /
      filled.length;
    if (score < bestScore) {
      bestScore = score;
      best = { ...size, score };
    }
  }
  return best;
}

const SizingGuide = () => {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState({
    thumb: '', index: '', middle: '', ring: '', pinky: '',
  });

  const [stepsRef,  stepsInView]  = useInView({ threshold: 0.1  });
  const [finderRef, finderInView] = useInView({ threshold: 0.08 });
  const [chartRef,  chartInView]  = useInView({ threshold: 0.08 });

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const recommendation = useMemo(() => getRecommendation(measurements), [measurements]);
  const filledCount = FINGERS.filter(f => measurements[f.key] !== '').length;

  const handleInput = (key, value) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const clearAll = () =>
    setMeasurements({ thumb: '', index: '', middle: '', ring: '', pinky: '' });

  return (
    <div className="sizing-page">

      {/* ── HERO ── */}
      <header className="sizing-hero">
        <span className="sizing-hero-eyebrow">— TUTORIALS</span>
        <h1 className="sizing-hero-title">FIND YOUR FIT</h1>
        <p className="sizing-hero-sub">
          Every ASTÉRI set comes in four sizes. Measure the width of your nail bed —
          not the length — at the widest point for an exact match.
        </p>
      </header>

      {/* ── HOW TO MEASURE ── */}
      <section
        ref={stepsRef}
        className={`sizing-steps-section ${stepsInView ? 'is-visible' : ''}`}
      >
        <div className="sizing-steps-inner">
          <Step num="01" title="PREPARE">
            Clean, dry nails. Gently push back your cuticles so the full width of your nail bed is visible.
          </Step>
          <div className="sizing-steps-arrow" aria-hidden="true">→</div>
          <Step num="02" title="MEASURE">
            Use a <strong>ruler</strong> or a <strong>measuring strip</strong> — lay it flat across the widest point of your nail bed and read the cm value.
          </Step>
          <div className="sizing-steps-arrow" aria-hidden="true">→</div>
          <Step num="03" title="MATCH">
            Enter your five measurements below. Your recommended size appears instantly.
          </Step>
        </div>
      </section>

      {/* ── INTERACTIVE FINDER ── */}
      <section
        ref={finderRef}
        className={`sizing-finder-section ${finderInView ? 'is-visible' : ''}`}
      >
        <div className="sizing-section-header">
          <span className="sizing-eyebrow">— INTERACTIVE TOOL</span>
          <h2 className="sizing-section-title">SIZE FINDER</h2>
        </div>

        <div className="finger-grid">
          {FINGERS.map((finger, i) => (
            <FingerCard
              key={finger.key}
              finger={finger}
              value={measurements[finger.key]}
              onChange={val => handleInput(finger.key, val)}
              index={i}
            />
          ))}
        </div>

        <div className={`rec-panel ${recommendation ? 'rec-panel--active' : ''}`}>
          {!recommendation ? (
            <p className="rec-hint">
              {filledCount === 0
                ? 'Enter a measurement above to begin.'
                : `${filledCount} / 5 fingers measured — add more for accuracy.`}
            </p>
          ) : (
            <RecResult
              recommendation={recommendation}
              measurements={measurements}
              onShop={() => navigate('/shop')}
              onClear={clearAll}
            />
          )}
        </div>
      </section>

      {/* ── SIZE CHART ── */}
      <section
        ref={chartRef}
        className={`sizing-chart-section ${chartInView ? 'is-visible' : ''}`}
      >
        <div className="sizing-section-header">
          <span className="sizing-eyebrow">— REFERENCE</span>
          <h2 className="sizing-section-title">SIZE CHART</h2>
          <p className="sizing-chart-note">All measurements in centimetres at widest point of nail bed.</p>
        </div>

        <div className="sizing-table">
          <div className="sizing-table-row sizing-table-head">
            <div className="sizing-table-cell sizing-table-cell--label">SIZE</div>
            {FINGERS.map(f => (
              <div key={f.key} className="sizing-table-cell">{f.label.toUpperCase()}</div>
            ))}
          </div>

          {SIZES.map(size => {
            const isMatch = recommendation?.name === size.name;
            return (
              <div
                key={size.name}
                className={`sizing-table-row ${isMatch ? 'sizing-table-row--match' : ''}`}
              >
                <div className="sizing-table-cell sizing-table-cell--label">
                  <span className={`size-pill ${isMatch ? 'size-pill--active' : ''}`}>
                    {size.name}
                  </span>
                  {isMatch && <span className="match-tag">YOUR FIT</span>}
                </div>
                {FINGERS.map(f => {
                  const userVal = parseFloat(measurements[f.key]);
                  const diff = !isNaN(userVal) ? userVal - size[f.key] : null;
                  return (
                    <div key={f.key} className="sizing-table-cell">
                      <span className="cell-cm">{size[f.key].toFixed(1)}</span>
                      {diff !== null && isMatch && (
                        <span className={`cell-diff ${diff >= 0 ? 'cell-diff--over' : 'cell-diff--under'}`}>
                          {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <p className="sizing-chart-tip">
          ✦ Between sizes? Always size up — press-ons should sit comfortably without lifting.
        </p>
      </section>

    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────── */

const Step = ({ num, title, children }) => (
  <div className="sizing-step">
    <span className="sizing-step-num">{num}</span>
    <h3 className="sizing-step-title">{title}</h3>
    <p className="sizing-step-desc">{children}</p>
  </div>
);

const FingerCard = ({ finger, value, onChange, index }) => (
  <div
    className={`finger-card ${value !== '' ? 'finger-card--filled' : ''}`}
    style={{ '--card-index': index }}
  >
    <div className="finger-nail-shape" aria-hidden="true" />
    <label className="finger-card-label" htmlFor={`input-${finger.key}`}>
      {finger.label}
    </label>
    <div className="finger-input-row">
      <input
        id={`input-${finger.key}`}
        type="text"
        inputMode="decimal"
        className="finger-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0.0"
        aria-label={`${finger.label} width in centimetres`}
        maxLength={4}
      />
      <span className="finger-unit">cm</span>
    </div>
  </div>
);

const RecResult = ({ recommendation, measurements, onShop, onClear }) => (
  <div className="rec-result">
    <div className="rec-result-main">
      <span className="rec-label">YOUR SIZE</span>
      <span className="rec-size-name">{recommendation.name}</span>
      <span className="rec-size-full">{recommendation.label}</span>
    </div>
    <div className="rec-chips">
      {FINGERS.map(f =>
        measurements[f.key] !== '' ? (
          <span key={f.key} className="rec-chip">
            {f.label} · {measurements[f.key]}cm
          </span>
        ) : null
      )}
    </div>
    <div className="rec-actions">
      <button className="rec-shop-btn" onClick={onShop}>
        Shop {recommendation.name} Sets ➜
      </button>
      <button className="rec-clear-btn" onClick={onClear}>
        Reset
      </button>
    </div>
  </div>
);

export default SizingGuide;

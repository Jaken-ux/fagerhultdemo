import { useState, useEffect, useRef } from 'react'

// De fem alternativen — Konkurrent (default/sämst) → Fagerhults bästa
// Siffror baserade på Fagerhults kontorsexempel (12 arbetsplatser, 90 kmv, 50 000h)
// Används som *referens* — verkliga värden skalas mot kundens egen kWh
const OPTIONS = [
  {
    id: 'competitor',
    tag: 'Din nuvarande',
    name: 'Standardarmatur',
    desc: '100 lm/W · L70 · ingen styrning',
    co2: 1815,
    kwh: 30192,
    bad: true,
  },
  {
    id: 'standard',
    tag: 'Fagerhult',
    name: 'Standard',
    desc: '140 lm/W · L70 · ingen styrning',
    co2: 1411,
    kwh: 21216,
  },
  {
    id: 'clo',
    tag: 'Fagerhult',
    name: 'Konstant ljus',
    desc: '140 lm/W · CLO · ingen styrning',
    co2: 1158,
    kwh: 15600,
  },
  {
    id: 'smart',
    tag: 'Fagerhult',
    name: 'Smart styrning',
    desc: '140 lm/W · CLO · närvaro + dagsljus',
    co2: 646,
    kwh: 9828,
  },
  {
    id: 'kvisten',
    tag: 'Fagerhult — Bäst',
    name: 'Kvisten i trä',
    desc: '140 lm/W · CLO · smart styrning · trä',
    co2: 344,
    kwh: 3120,
  },
]

const BASELINE = OPTIONS[0]
const REF_KWH = BASELINE.kwh // 30192 — referenskund som proportioner utgår från
const ELPRIS = 1.5 // kr/kWh

// Smooth tween hook för stora siffror
function useTween(target, duration = 1100) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const startRef = useRef(performance.now())
  const rafRef = useRef(null)

  useEffect(() => {
    fromRef.current = value
    startRef.current = performance.now()
    cancelAnimationFrame(rafRef.current)

    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration)
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const next = fromRef.current + (target - fromRef.current) * eased
      setValue(next)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return value
}

function formatNumber(n) {
  return Math.round(n).toLocaleString('sv-SE').replace(/ /g, ' ')
}

export default function App() {
  const [rawKwh, setRawKwh] = useState('')
  const customerKwh = rawKwh ? parseInt(rawKwh, 10) : 0
  const hasInput = customerKwh > 0

  const [selectedId, setSelectedId] = useState('competitor')
  const selectedRef = OPTIONS.find((o) => o.id === selectedId)

  // Skala referensvärden proportionellt mot kundens kWh
  const scale = hasInput ? customerKwh / REF_KWH : 0
  const selectedKwh = selectedRef.kwh * scale
  const selectedCo2 = selectedRef.co2 * scale
  const baselineKwh = BASELINE.kwh * scale

  const co2 = useTween(selectedCo2)
  const kwh = useTween(selectedKwh)

  // Stapelhöjd i procent av baseline (konkurrent = 100%)
  const co2Pct = hasInput ? (selectedRef.co2 / BASELINE.co2) * 100 : 0
  const kwhPct = hasInput ? (selectedRef.kwh / BASELINE.kwh) * 100 : 0

  const co2Delta = (selectedRef.co2 - BASELINE.co2) * scale
  const kwhDelta = (selectedRef.kwh - BASELINE.kwh) * scale
  const co2DeltaPct = ((selectedRef.co2 - BASELINE.co2) / BASELINE.co2) * 100
  const kwhDeltaPct = ((selectedRef.kwh - BASELINE.kwh) / BASELINE.kwh) * 100

  const sekSavings = (baselineKwh - selectedKwh) * ELPRIS

  const isWorst = selectedRef.bad

  const handleKwhChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8)
    setRawKwh(cleaned)
  }

  return (
    <>
      <div className="app-bg" />
      <main className="shell">
        <header className="brand">
          <div className="brand-mark">
            <span className="brand-dot" />
            <span className="brand-name">Fagerhult</span>
          </div>
          <span className="brand-meta">Hållbarhetskalkyl · v0.1</span>
        </header>

        <section className="hero">
          <span className="hero-eyebrow">Säljverktyg · fastighet</span>
          <h1 className="hero-title">
            Se hur mycket CO₂ och energi <em>din kund kan spara</em> — med rätt val av armatur.
          </h1>
          <p className="hero-sub">
            Mata in kundens nuvarande årsförbrukning. Vi visar direkt hur mycket utsläpp,
            energi och kronor som sparas med varje Fagerhult-alternativ.
          </p>
        </section>

        <section className="kwh-section">
          <label className="kwh-label" htmlFor="kwh-input">
            Steg 1 · Din nuvarande förbrukning
          </label>
          <div className={`kwh-input-row ${hasInput ? 'has-value' : ''}`}>
            <input
              id="kwh-input"
              type="text"
              inputMode="numeric"
              className="kwh-input"
              placeholder="t.ex. 30 000"
              value={rawKwh}
              onChange={handleKwhChange}
              autoFocus
              autoComplete="off"
            />
            <span className="kwh-input-suffix">kWh / år</span>
          </div>
          <span className="kwh-hint">
            Hela fastighetens årliga elförbrukning — slå upp på elräkningen
          </span>
        </section>

        <section className={`selector ${!hasInput ? 'is-disabled' : ''}`}>
          <span className="selector-label">Steg 2 · Välj armatur</span>
          <div className="options">
            {OPTIONS.map((opt) => {
              const active = opt.id === selectedId
              return (
                <button
                  key={opt.id}
                  className={`opt ${active ? 'active' : ''} ${active && opt.bad ? 'bad' : ''}`}
                  onClick={() => setSelectedId(opt.id)}
                  disabled={!hasInput}
                >
                  <span className="opt-tag">{opt.tag}</span>
                  <span className="opt-name">{opt.name}</span>
                  <span className="opt-desc">{opt.desc}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className={`stage ${!hasInput ? 'is-empty' : ''}`}>
          <div className="bars">
            <div className="bar-col">
              <div className="bar-track">
                <div
                  className={`bar-fill ${isWorst ? 'is-bad' : ''}`}
                  style={{ height: `${co2Pct}%` }}
                />
              </div>
              <div className="bar-meta">
                <span className="bar-label">CO₂</span>
                <span className="bar-unit">kg CO₂e</span>
              </div>
            </div>

            <div className="bar-col">
              <div className="bar-track">
                <div
                  className={`bar-fill ${isWorst ? 'is-bad' : ''}`}
                  style={{ height: `${kwhPct}%` }}
                />
              </div>
              <div className="bar-meta">
                <span className="bar-label">Energi</span>
                <span className="bar-unit">kWh / år</span>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat-block">
              <span className="stat-label">CO₂-utsläpp</span>
              <div className="stat-value">
                {hasInput ? formatNumber(co2) : '—'}
                <span className="stat-value-unit">kg CO₂e</span>
              </div>
              {hasInput && (
                <>
                  <Delta delta={co2Delta} pct={co2DeltaPct} isBaseline={isWorst} />
                  <SekSavings savings={sekSavings} isBaseline={isWorst} />
                </>
              )}
            </div>

            <div className="divider" />

            <div className="stat-block">
              <span className="stat-label">Energiförbrukning</span>
              <div className="stat-value">
                {hasInput ? formatNumber(kwh) : '—'}
                <span className="stat-value-unit">kWh / år</span>
              </div>
              {hasInput && (
                <>
                  <Delta delta={kwhDelta} pct={kwhDeltaPct} isBaseline={isWorst} unit="kWh" />
                  <SekSavings savings={sekSavings} isBaseline={isWorst} />
                </>
              )}
            </div>
          </div>

          {!hasInput && (
            <div className="stage-empty-overlay">
              <span className="stage-empty-icon">↑</span>
              <span className="stage-empty-text">
                Ange kundens nuvarande förbrukning för att börja
              </span>
            </div>
          )}
        </section>

        <footer className="footnote">
          <span>Proportioner från Fagerhults kontorsexempel — skalat mot kundens egen förbrukning</span>
          <span className="footnote-pulse">
            <span className="pulse-dot" /> Live-data
          </span>
        </footer>
      </main>
    </>
  )
}

function SekSavings({ savings, isBaseline }) {
  if (isBaseline) return null
  return (
    <span className="stat-savings">
      ≈ {formatNumber(savings)} kr / år sparas vs nuvarande
    </span>
  )
}

function Delta({ delta, pct, isBaseline, unit = 'kg' }) {
  if (isBaseline) {
    return (
      <span className="stat-delta neutral">
        Kundens nuvarande nivå
      </span>
    )
  }
  const improved = delta < 0
  const cls = improved ? 'improvement' : 'worse'
  const arrow = improved ? '↓' : '↑'
  const sign = improved ? '−' : '+'
  return (
    <span className={`stat-delta ${cls}`}>
      <span className="stat-delta-arrow">{arrow}</span>
      {sign}
      {formatNumber(Math.abs(delta))} {unit} ({sign}
      {Math.abs(Math.round(pct))}%) vs nuvarande
    </span>
  )
}

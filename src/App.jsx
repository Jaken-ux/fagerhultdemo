import { useState, useEffect, useRef } from 'react'

// De fyra alternativen — Konkurrent (default/sämst) → Fagerhults bästa
// Siffror baserade på Fagerhults kontorsexempel (12 arbetsplatser, 90 kmv, 50 000h)
const OPTIONS = [
  {
    id: 'competitor',
    tag: 'Konkurrent',
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

const BASELINE = OPTIONS[0] // konkurrent = referens för delta
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
  return Math.round(n).toLocaleString('sv-SE').replace(/\u00A0/g, ' ')
}

export default function App() {
  const [selectedId, setSelectedId] = useState('competitor')
  const selected = OPTIONS.find((o) => o.id === selectedId)

  // Stapelanimation från 0 vid första laddning — flippar efter första paint
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const co2 = useTween(selected.co2)
  const kwh = useTween(selected.kwh)

  // Stapelhöjd i procent av baseline (konkurrent = 100%)
  const co2Pct = (selected.co2 / BASELINE.co2) * 100
  const kwhPct = (selected.kwh / BASELINE.kwh) * 100

  const co2Delta = selected.co2 - BASELINE.co2
  const kwhDelta = selected.kwh - BASELINE.kwh
  const co2DeltaPct = ((selected.co2 - BASELINE.co2) / BASELINE.co2) * 100
  const kwhDeltaPct = ((selected.kwh - BASELINE.kwh) / BASELINE.kwh) * 100

  const sekSavings = (BASELINE.kwh - selected.kwh) * ELPRIS

  const isWorst = selected.bad

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
          <span className="hero-eyebrow">Kontorsexempel · 12 arbetsplatser</span>
          <h1 className="hero-title">
            Se hur mycket CO₂ och energi <em>din kund kan spara</em> — med rätt val av armatur.
          </h1>
          <p className="hero-sub">
            Inför nya rapporteringskrav räcker det inte att gissa. Välj armatur nedan och se direkt
            hur utsläpp och förbrukning förändras jämfört med branschens standardalternativ.
          </p>
        </section>

        <section className="selector">
          <span className="selector-label">Välj armatur</span>
          <div className="options">
            {OPTIONS.map((opt) => {
              const active = opt.id === selectedId
              return (
                <button
                  key={opt.id}
                  className={`opt ${active ? 'active' : ''} ${active && opt.bad ? 'bad' : ''}`}
                  onClick={() => setSelectedId(opt.id)}
                >
                  <span className="opt-tag">{opt.tag}</span>
                  <span className="opt-name">{opt.name}</span>
                  <span className="opt-desc">{opt.desc}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="stage">
          <div className="bars">
            <div className="bar-col">
              <div className="bar-track">
                <div
                  className={`bar-fill ${isWorst ? 'is-bad' : ''}`}
                  style={{ height: `${mounted ? co2Pct : 0}%` }}
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
                  style={{ height: `${mounted ? kwhPct : 0}%` }}
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
                {formatNumber(co2)}
                <span className="stat-value-unit">kg CO₂e</span>
              </div>
              <Delta delta={co2Delta} pct={co2DeltaPct} isBaseline={isWorst} />
              <SekSavings savings={sekSavings} isBaseline={isWorst} />
            </div>

            <div className="divider" />

            <div className="stat-block">
              <span className="stat-label">Energiförbrukning</span>
              <div className="stat-value">
                {formatNumber(kwh)}
                <span className="stat-value-unit">kWh / år</span>
              </div>
              <Delta delta={kwhDelta} pct={kwhDeltaPct} isBaseline={isWorst} unit="kWh" />
              <SekSavings savings={sekSavings} isBaseline={isWorst} />
            </div>
          </div>
        </section>

        <footer className="footnote">
          <span>Underlag: kontorsexempel — 12 arbetsplatser · 90 kmv · 50 000 h livslängd</span>
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
      ≈ {formatNumber(savings)} kr / år sparas vs konkurrent
    </span>
  )
}

function Delta({ delta, pct, isBaseline, unit = 'kg' }) {
  if (isBaseline) {
    return (
      <span className="stat-delta neutral">
        Referensvärde — branschstandard
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
      {Math.abs(Math.round(pct))}%) vs konkurrent
    </span>
  )
}

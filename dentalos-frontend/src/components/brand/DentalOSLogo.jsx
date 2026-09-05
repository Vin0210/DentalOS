import './DentalOSLogo.css'

// Single source of truth for the DentalOS identity.
// Symbol: geometric tooth + negative-space "D" + circuit trace + connection node.
// Do not duplicate this SVG elsewhere — reuse <DentalOSLogo />.

const SIZES = { xsmall: 18, small: 24, medium: 32, large: 44, xlarge: 64 }

// variant picks a palette directly; theme overrides it for the target background.
const PALETTES = {
  color: {
    tooth: 'var(--primary, #0F766E)',
    accent: 'var(--primary-light, #14B8A6)',
    dental: 'var(--text-primary, #0F172A)',
    os: 'var(--primary, #0F766E)',
  },
  light: { tooth: '#FFFFFF', accent: '#2DD4BF', dental: '#FFFFFF', os: '#5EEAD4' },
  dark: { tooth: '#0F172A', accent: '#14B8A6', dental: '#0F172A', os: '#0D9488' },
  mono: { tooth: 'currentColor', accent: 'currentColor', dental: 'currentColor', os: 'currentColor' },
}

const THEME_TO_VARIANT = { dark: 'light', light: 'dark', mono: 'mono' }

// 48×48 grid. Second subpath (the "D") is carved out via evenodd.
export const TOOTH_PATH = 'M24 5C32 5 40 7.5 40 16C40 22.5 37.5 26 36.2 31C35 36.5 34.2 42 30 42C26.8 42 27.2 36.5 24 36.5C20.8 36.5 21.2 42 18 42C13.8 42 13 36.5 11.8 31C10.5 26 8 22.5 8 16C8 7.5 16 5 24 5ZM17 12L25 12A6.5 6.5 0 0 1 25 25L17 25Z'

export default function DentalOSLogo({
  variant = 'color',
  size = 'medium',
  showWordmark = true,
  animated = false,
  theme,
  collapseMotion = false,
  className = '',
  style,
}) {
  const px = typeof size === 'number' ? size : (SIZES[size] ?? SIZES.medium)
  const resolved = theme ? (THEME_TO_VARIANT[theme] ?? variant) : variant
  const pal = PALETTES[resolved] ?? PALETTES.color
  const wordHidden = showWordmark === false

  return (
    <span
      className={`dos-logo${animated ? ' dos-animated' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--dos-size': `${px}px`, '--dos-gap': collapseMotion && wordHidden ? '0px' : undefined, ...style }}
      role="img"
      aria-label="DentalOS"
    >
      <span className="dos-mark">
        <span className="dos-glow" aria-hidden />
        <svg viewBox="0 0 48 48" width={px} height={px} aria-hidden focusable="false">
          <path fillRule="evenodd" clipRule="evenodd" fill={pal.tooth} d={TOOTH_PATH} />
          <path className="dos-trace" d="M24 27.5V35.5" stroke={pal.accent} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle className="dos-node" cx="24" cy="38.8" r="2.2" fill={pal.accent} />
        </svg>
      </span>
      {(!wordHidden || collapseMotion) && (
        <span
          className={`dos-word${wordHidden ? ' dos-word-off' : ''}`}
          style={{ fontSize: Math.max(12, Math.round(px * 0.8)) }}
          aria-hidden={wordHidden || undefined}
        >
          <span style={{ color: pal.dental }}>Dental</span>
          <span style={{ color: pal.os }}>OS</span>
        </span>
      )}
    </span>
  )
}
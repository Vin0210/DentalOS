// Anatomical tooth-type system for the live chart.
// Every FDI position maps to a distinct tooth type with its own crown + root
// anatomy, orientation, surfaces, name and educational fact. No generic reuse:
// central/lateral incisors, canines, premolars, molars and wisdom teeth each
// have dedicated SVG art, adapted for maxillary (upper) vs mandibular (lower).

export const ARCH_UPPER = 'upper'
export const ARCH_LOWER = 'lower'

export const TYPES = {
  CENTRAL: 'central',
  LATERAL: 'lateral',
  CANINE: 'canine',
  PREMOLAR1: 'premolar1',
  PREMOLAR2: 'premolar2',
  MOLAR1: 'molar1',
  MOLAR2: 'molar2',
  WISDOM: 'wisdom',
}

const TYPE_LABEL = {
  central: 'central incisor',
  lateral: 'lateral incisor',
  canine: 'canine',
  premolar1: 'first premolar',
  premolar2: 'second premolar',
  molar1: 'first molar',
  molar2: 'second molar',
  wisdom: 'wisdom tooth',
}

const TYPE_FACT = {
  central: 'Central incisors do most of the biting — they take the highest bite force of the front teeth.',
  lateral: 'Lateral incisors guide the bite as the jaw slides sideways.',
  canine: 'Canines have the longest roots of any human teeth, anchoring the corners of the smile.',
  premolar1: 'First premolars have a prominent cheek-side cusp built for tearing and crushing.',
  premolar2: 'Second premolars have flatter, even cusps made for grinding food.',
  molar1: 'First molars do most of the chewing — they erupt around age six, before any baby tooth falls out.',
  molar2: 'Second molars back up the first molars and usually arrive in the early teens.',
  wisdom: 'Wisdom teeth are the most variable teeth — some people never grow all four.',
}

const ANTERIOR = new Set(['central', 'lateral', 'canine'])
export const isAnterior = (type) => ANTERIOR.has(type)
export const surfacesFor = (type) =>
  isAnterior(type)
    ? ['mesial', 'distal', 'facial', 'lingual', 'incisal']
    : ['mesial', 'distal', 'buccal', 'lingual', 'occlusal']

// FDI → anatomy. Quadrants: 1 = upper right, 2 = upper left, 3 = lower left, 4 = lower right.
const QUADRANT = { 1: ['upper', 'right'], 2: ['upper', 'left'], 3: ['lower', 'left'], 4: ['lower', 'right'] }
// Within every quadrant the second digit runs mesial → distal (central → wisdom).
const MESIAL_TO_DISTAL = ['central', 'lateral', 'canine', 'premolar1', 'premolar2', 'molar1', 'molar2', 'wisdom']

export const TOOTH_INFO = {}
for (const q of [1, 2, 3, 4]) {
  const [arch, side] = QUADRANT[q]
  MESIAL_TO_DISTAL.forEach((type, i) => {
    const n = String(q * 10 + (i + 1))
    TOOTH_INFO[n] = {
      number: n,
      type,
      arch,
      side,
      name: `${arch === 'upper' ? 'Upper' : 'Lower'} ${side} ${TYPE_LABEL[type]}`,
      fact: TYPE_FACT[type],
      anterior: isAnterior(type),
    }
  })
}
export const toothInfo = (n) => TOOTH_INFO[String(n)] || { number: String(n), type: 'premolar2', arch: 'upper', side: 'right', name: `Tooth #${n}`, fact: '', anterior: false }

// Orientation along the arch: posterior teeth angle outward, ends dip/rise gently.
// Row order matches TEETH_UPPER / TEETH_LOWER (16 entries, midline at 7.5).
export function orientationFor(index16, arch) {
  const off = index16 - 7.5
  const tilt = Math.max(-8, Math.min(8, off * -1.1))
  const lift = Math.round(off * off * 0.28) * (arch === 'lower' ? -1 : 1)
  return { tilt, lift }
}

// ── Front-view art, 40×56 box (crown y2–30, roots to y54) ──
// Each entry: crown outline, root shapes, occlusal grooves, condition landmarks.
const ART = {
  central: {
    upper: {
      crown: 'M10 7 L30 7 L28 25 Q20 30 12 25 Z',
      roots: ['M17 28 L23 28 L21 51 Q20 54 19 51 Z'],
      grooves: ['M20 9 L20 22'],
      caries: [20, 14], filling: [15, 10, 10, 7], fracture: 'M11 12 L18 17 L15 23',
    },
    lower: {
      crown: 'M13 9 L27 9 L25 25 Q20 28 15 25 Z',
      roots: ['M18 27 L22 27 L20 51 Q20 53 19.5 51 Z'],
      grooves: ['M20 11 L20 21'],
      caries: [20, 15], filling: [16, 12, 8, 6], fracture: 'M14 13 L20 18 L17 23',
    },
  },
  lateral: {
    upper: {
      crown: 'M12 9 Q20 5 28 9 L26 25 Q20 29 14 25 Z',
      roots: ['M18 27 L22 27 L20 50 Q20 52 19.5 50 Z'],
      grooves: ['M20 11 L20 21'],
      caries: [24, 15], filling: [15, 11, 9, 6], fracture: 'M13 13 L19 18 L16 23',
    },
    lower: {
      crown: 'M14 10 Q20 7 26 10 L24 25 Q20 28 16 25 Z',
      roots: ['M18.5 27 L21.5 27 L20 50 Q20 52 19.8 50 Z'],
      grooves: [],
      caries: [23, 16], filling: [16, 12, 8, 5], fracture: 'M15 14 L20 18',
    },
  },
  canine: {
    upper: {
      crown: 'M11 11 L20 3 L29 11 L27 26 Q20 31 13 26 Z',
      roots: ['M17 29 L23 29 L21 52 Q20 55 19 52 Z'],
      grooves: ['M20 6 L20 20'],
      caries: [20, 13], filling: [15, 10, 10, 7], fracture: 'M12 12 L19 16 L15 24',
    },
    lower: {
      crown: 'M13 11 L20 4 L27 11 L25 26 Q20 30 15 26 Z',
      roots: ['M18 28 L22 28 L20 52 Q20 55 19.5 52 Z'],
      grooves: ['M20 7 L20 19'],
      caries: [20, 13], filling: [16, 10, 8, 6], fracture: 'M14 12 L20 17 L17 23',
    },
  },
  premolar1: {
    upper: {
      crown: 'M11 13 L16 5 L21 11 L25 7 L29 13 L27 26 Q20 31 13 26 Z',
      roots: ['M15 29 L18.5 29 L17.5 50 Q17 52 16.5 50 Z', 'M22 29 L25 29 L24 43 Q23.5 45 23 43 Z'],
      grooves: ['M20 12 L20 22'],
      caries: [25, 14], filling: [14, 11, 8, 6], fracture: 'M12 14 L19 18 L16 24',
    },
    lower: {
      crown: 'M12 13 L17 8 L20 12 L23 8 L28 13 L26 26 Q20 30 14 26 Z',
      roots: ['M18 28 L22 28 L20 50 Q20 52 19.5 50 Z'],
      grooves: ['M20 14 L20 21'],
      caries: [24, 15], filling: [15, 12, 8, 5], fracture: 'M13 15 L19 19',
    },
  },
  premolar2: {
    upper: {
      crown: 'M10 11 L15 6 L20 10 L25 6 L30 11 L28 26 Q20 31 12 26 Z',
      roots: ['M17 29 L23 29 L20 50 Q20 52 19.5 50 Z'],
      grooves: ['M14 12 L26 12', 'M20 8 L20 20'],
      caries: [20, 13], filling: [14, 10, 12, 6], fracture: 'M12 14 L19 17 L16 23',
    },
    lower: {
      crown: 'M11 12 L16 7 L20 11 L24 7 L29 12 L27 26 Q20 30 13 26 Z',
      roots: ['M18 28 L22 28 L20 49 Q20 51 19.5 49 Z'],
      grooves: ['M15 13 L25 13'],
      caries: [20, 14], filling: [15, 11, 10, 5], fracture: 'M13 15 L19 18',
    },
  },
  molar1: {
    upper: {
      crown: 'M8 9 L13 5 L18 8 L22 5 L27 8 L32 9 L30 25 Q20 31 10 25 Z',
      roots: ['M11 28 L15 28 L14 49 Q13.5 51 13 49 Z', 'M25 28 L29 28 L27 49 Q26.5 51 26 49 Z', 'M18 29 L22 29 L20 42 Q19.5 44 19 42 Z'],
      grooves: ['M13 10 L27 10', 'M20 6 L20 20', 'M14 10 L14 18', 'M26 10 L26 18'],
      caries: [20, 12], filling: [13, 9, 14, 7], fracture: 'M10 13 L18 16 L14 22 L22 25',
    },
    lower: {
      crown: 'M9 10 L14 6 L19 9 L24 6 L31 10 L29 25 Q20 31 11 25 Z',
      roots: ['M12 28 L16.5 28 L15 50 Q14.5 52 14 50 Z', 'M23.5 28 L28 28 L26 50 Q25.5 52 25 50 Z'],
      grooves: ['M14 11 L26 11', 'M20 7 L20 21'],
      caries: [20, 13], filling: [14, 10, 12, 6], fracture: 'M11 14 L19 17 L15 23',
    },
  },
  molar2: {
    upper: {
      crown: 'M10 10 Q20 4 30 10 L28 25 Q20 30 12 25 Z',
      roots: ['M13 28 L16.5 28 L15.5 48 Q15 50 14.5 48 Z', 'M23.5 28 L27 28 L25.5 48 Q25 50 24.5 48 Z'],
      grooves: ['M15 12 L25 12', 'M20 8 L20 20'],
      caries: [20, 13], filling: [14, 11, 12, 6], fracture: 'M12 14 L19 17 L16 22',
    },
    lower: {
      crown: 'M11 11 Q20 6 29 11 L27 25 Q20 30 13 25 Z',
      roots: ['M14 28 L17.5 28 L16.5 49 Q16 51 15.5 49 Z', 'M22.5 28 L26 28 L24.5 49 Q24 51 23.5 49 Z'],
      grooves: ['M16 13 L24 13'],
      caries: [20, 14], filling: [15, 12, 10, 5], fracture: 'M13 15 L19 18',
    },
  },
  wisdom: {
    upper: {
      crown: 'M9 12 L15 6 L20 10 L26 7 L31 12 L29 24 Q24 29 19 27 Q13 29 11 24 Z',
      roots: ['M14 28 L20 28 L18 46 Q17 48 16 46 Z', 'M22 28 L27 28 L24 45 Q23 47 22 45 Z'],
      grooves: ['M15 13 L24 12'],
      caries: [24, 13], filling: [14, 11, 10, 6], fracture: 'M11 15 L18 17 L15 22',
    },
    lower: {
      crown: 'M11 13 L16 8 L21 11 L26 9 L29 14 L27 24 Q21 29 15 26 Z',
      roots: ['M15 28 L21 28 L19 47 Q18 49 17 47 Z', 'M22 28 L26 28 L24 46 Q23 48 22.5 46 Z'],
      grooves: ['M16 14 L23 13'],
      caries: [22, 15], filling: [15, 12, 9, 5], fracture: 'M13 16 L19 18',
    },
  },
}

export const artFor = (type, arch) => ART[type]?.[arch] || ART.premolar2.upper

// Occlusal (chewing-surface) glyphs per type, 40×56 box.
export const OCCLUSAL = {
  central: { shape: 'M9 23 L31 23 L31 31 L9 31 Z', grooves: ['M12 25 L28 25', 'M12 29 L28 29'], pits: [] },
  lateral: { shape: 'M12 24 L28 24 L28 31 L12 31 Z', grooves: ['M15 26 L25 26'], pits: [] },
  canine: { shape: 'M20 17 L28 27 L20 37 L12 27 Z', grooves: ['M20 21 L20 33'], pits: [[20, 27]] },
  premolar1: { shape: 'M20 16 m-10 0 a10 9 0 1 0 20 0 a10 9 0 1 0 -20 0', grooves: ['M20 19 L20 33', 'M13 25 L27 23'], pits: [[20, 26]] },
  premolar2: { shape: 'M20 15 m-11 0 a11 10 0 1 0 22 0 a11 10 0 1 0 -22 0', grooves: ['M20 18 L20 34', 'M11 26 L29 26'], pits: [[20, 26]] },
  molar1: { shape: 'M10 16 L30 16 L30 38 L10 38 Z', grooves: ['M10 27 L30 27', 'M20 16 L20 38', 'M15 16 L15 22', 'M25 32 L25 38'], pits: [[15, 21], [25, 21], [15, 32], [25, 32]] },
  molar2: { shape: 'M11 17 Q20 14 29 17 Q31 27 29 37 Q20 40 11 37 Q9 27 11 17 Z', grooves: ['M12 27 L28 27', 'M20 17 L20 37'], pits: [[15, 22], [25, 22], [15, 32], [25, 32]] },
  wisdom: { shape: 'M12 18 Q20 14 28 18 Q30 27 27 36 Q20 39 13 36 Q10 27 12 18 Z', grooves: ['M14 26 L26 28'], pits: [[17, 22], [24, 24], [20, 32]] },
}

// Side profiles per type (crown + root from the side), 40×56 box.
export const SIDE = {
  central: { crown: 'M14 4 L26 4 L24 28 Q20 31 16 28 Z', roots: ['M18 29 L22 29 L20 52 Q20 54 19.5 52 Z'] },
  lateral: { crown: 'M15 5 L25 5 L23 28 Q20 30 17 28 Z', roots: ['M18.5 29 L21.5 29 L20 51 Q20 53 19.8 51 Z'] },
  canine: { crown: 'M14 8 L20 3 L26 8 L24 28 Q20 31 16 28 Z', roots: ['M18 29 L22 29 L20 53 Q20 55 19.5 53 Z'] },
  premolar1: { crown: 'M13 8 L20 4 L27 8 L25 28 Q20 31 15 28 Z', roots: ['M18 29 L22 29 L20 51 Q20 53 19.5 51 Z'] },
  premolar2: { crown: 'M12 7 L20 4 L28 7 L26 28 Q20 31 14 28 Z', roots: ['M18 29 L22 29 L20 50 Q20 52 19.5 50 Z'] },
  molar1: { crown: 'M10 6 L30 6 L28 28 Q20 32 12 28 Z', roots: ['M14 29 L18 29 L17 49 Q16.5 51 16 49 Z', 'M22 29 L26 29 L24 49 Q23.5 51 23 49 Z'] },
  molar2: { crown: 'M11 7 L29 7 L27 28 Q20 31 13 28 Z', roots: ['M15 29 L19 29 L18 48 Q17.5 50 17 48 Z', 'M21 29 L25 29 L23 48 Q22.5 50 22 48 Z'] },
  wisdom: { crown: 'M12 8 L28 8 L26 27 Q20 31 14 27 Z', roots: ['M16 29 L24 29 L20 46 Q19 48 18 46 Z'] },
}

// Root-canal paths per type+arch (chamber outlet → apices), 40×56 box.
// Plain array = both arches; { upper, lower } where they differ.
const CANALS = {
  central: [['M20 26 L20 50']],
  lateral: [['M20 26 L20 49']],
  canine: [['M20 26 L20 51']],
  premolar1: {
    upper: [['M18 26 L17 49'], ['M22 26 L23.5 42']],
    lower: [['M20 26 L20 49']],
  },
  premolar2: [['M20 26 L20 49']],
  molar1: {
    upper: [['M16 26 L14 48'], ['M24 26 L26 48'], ['M20 26 L20 41']],
    lower: [['M16 26 L15 49'], ['M24 26 L25 49']],
  },
  molar2: {
    upper: [['M17 26 L15.5 47'], ['M23 26 L24.5 47']],
    lower: [['M17 26 L16 48'], ['M23 26 L24 48']],
  },
  wisdom: {
    upper: [['M18 26 L17 45']],
    lower: [['M19 26 L18 46']],
  },
}

export const canalsFor = (type, arch) => {
  const c = CANALS[type] || CANALS.premolar2
  return Array.isArray(c) ? c : (c[arch] || c.upper || [])
}
// Lingual / palatal view art per type: cingulum, fossae, ridge detail.
// Same 40×56 box; grooves[] reuse the SIDE profile lines.
export const LINGUAL = {
  central: { crown: 'M10 7 L30 7 L28 25 Q20 30 12 25 Z', cingulum: [20, 22, 6, 3], details: ['M14 12 L26 12'], dots: [] },
  lateral: { crown: 'M12 9 Q20 5 28 9 L26 25 Q20 29 14 25 Z', cingulum: [20, 21, 5, 2.5], details: [], dots: [] },
  canine: { crown: 'M11 11 L20 3 L29 11 L27 26 Q20 31 13 26 Z', cingulum: [20, 22, 4.5, 3], details: ['M20 8 L20 19'], dots: [] },
  premolar1: { crown: 'M11 12 L16 6 L20 10 L24 7 L29 12 L27 26 Q20 31 13 26 Z', cingulum: null, details: ['M20 12 L20 22'], dots: [[20, 17]] },
  premolar2: { crown: 'M10 11 L15 6 L20 10 L25 6 L30 11 L28 26 Q20 31 12 26 Z', cingulum: null, details: ['M14 13 L26 13'], dots: [[20, 18]] },
  molar1: { crown: 'M8 9 L13 5 L18 8 L22 5 L27 8 L32 9 L30 25 Q20 31 10 25 Z', cingulum: null, details: ['M12 14 L28 14', 'M20 9 L20 22'], dots: [[15, 18], [25, 18]] },
  molar2: { crown: 'M10 10 Q20 4 30 10 L28 25 Q20 30 12 25 Z', cingulum: null, details: ['M14 15 L26 15'], dots: [[16, 19], [24, 19]] },
  wisdom: { crown: 'M9 12 L15 6 L20 10 L26 7 L31 12 L29 24 Q24 29 19 27 Q13 29 11 24 Z', cingulum: null, details: ['M15 16 L24 15'], dots: [[18, 20], [23, 22]] },
}

// Relative crown proportions (width × height) per type+arch — molars read
// large and broad, incisors narrow, canines long. Used by the atlas so size
// differences are immediately comparable.
export const PROPORTIONS = {
  central: { upper: { w: 1.0, h: 1.0 }, lower: { w: 0.76, h: 0.92 } },
  lateral: { upper: { w: 0.82, h: 0.92 }, lower: { w: 0.72, h: 0.9 } },
  canine: { upper: { w: 0.9, h: 1.08 }, lower: { w: 0.84, h: 1.12 } },
  premolar1: { upper: { w: 0.9, h: 0.96 }, lower: { w: 0.86, h: 0.92 } },
  premolar2: { upper: { w: 0.95, h: 0.92 }, lower: { w: 0.9, h: 0.9 } },
  molar1: { upper: { w: 1.18, h: 1.0 }, lower: { w: 1.15, h: 1.03 } },
  molar2: { upper: { w: 1.1, h: 0.95 }, lower: { w: 1.08, h: 0.97 } },
  wisdom: { upper: { w: 1.0, h: 0.88 }, lower: { w: 0.98, h: 0.9 } },
}
export const proportionFor = (type, arch) => (PROPORTIONS[type] || PROPORTIONS.premolar2)[arch] || { w: 1, h: 1 }

// Concise morphology notes for reference labels.
export const MORPHOLOGY = {
  central: { upper: ['Broad flat crown', 'Straight incisal edge', 'Single root'], lower: ['Narrow symmetrical crown', 'Smallest permanent tooth', 'Single root'] },
  lateral: { upper: ['Smaller rounded crown', 'Rounded incisal corners', 'Single root'], lower: ['Slightly larger than central', 'Faint incisal grooves', 'Single root'] },
  canine: { upper: ['Single prominent cusp', 'Labial ridge', 'Long single root'], lower: ['Slimmer cusp', 'Long single root', 'Narrower crown'] },
  premolar1: { upper: ['Tall buccal cusp', 'Small palatal cusp', 'Two roots: buccal + palatal'], lower: ['Small even cusps', 'Single root', 'Compact crown'] },
  premolar2: { upper: ['Two even cusps', 'Broad occlusal table', 'Single root'], lower: ['Even low cusps', 'Rounded crown', 'Single root'] },
  molar1: { upper: ['Four cusps, rhomboid outline', 'Oblique ridge', 'Three roots: 2 buccal + palatal'], lower: ['Five cusps, cruciform grooves', 'Broad rectangular crown', 'Two roots: mesial + distal'] },
  molar2: { upper: ['Four cusps, rounded crown', 'Supplemental grooves', 'Three roots, often fused'], lower: ['Four cusps, cross grooves', 'Smaller than first molar', 'Two roots, close-set'] },
  wisdom: { upper: ['Irregular 3–5 cusps', 'Variable crown form', 'Fused conical roots'], lower: ['Irregular cusps', 'Variable size', 'Short fused roots'] },
}
export const morphologyFor = (type, arch) => (MORPHOLOGY[type] || MORPHOLOGY.premolar2)[arch] || []

export const chamberFor = (type) => {
  const upper = { central: [20, 20], lateral: [20, 20], canine: [20, 19], premolar1: [20, 19], premolar2: [20, 19], molar1: [20, 18], molar2: [20, 18], wisdom: [20, 18] }
  const [cx, cy] = upper[type] || [20, 19]
  return { cx, cy, rx: type.startsWith('molar') || type === 'wisdom' ? 7 : 4.5, ry: 6 }
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Expand, Minus, Plus, RotateCw, Shrink, Trash2, Upload, X } from 'lucide-react'
import { EASE } from '../motion/Motion.jsx'
import { fmtDate } from '../../utils/format.js'
import './ImageViewer.css'

// Dark clinical image viewer: zoom, pan (drag), rotate, fullscreen, metadata.
export default function ImageViewer({ images, onUpload, onDelete }) {
  const [active, setActive] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [rot, setRot] = useState(0)
  const [full, setFull] = useState(false)

  const open = (img) => { setActive(img); setZoom(1); setRot(0); setFull(false) }

  return (
    <div>
      <div className="img-grid">
        {images.map((img) => (
          <motion.button
            key={img.id} className="img-thumb" onClick={() => open(img)}
            whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
            aria-label={`Open ${img.name}`}
          >
            <img src={img.src} alt={img.name} loading="lazy" draggable={false} />
            <span className="img-cap"><b>{img.name}</b><i>{img.category} · {fmtDate(img.date)}</i></span>
          </motion.button>
        ))}
        <label className="img-upload">
          <Upload size={20} /><span>Upload X-ray / photo</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onUpload?.({ id: Date.now(), name: f.name, category: 'upload', date: new Date().toISOString(), src: URL.createObjectURL(f), by: 'You' })
            e.target.value = ''
          }} />
        </label>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div className={`viewer${full ? ' full' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="viewer-bar">
              <div><b>{active.name}</b><p className="small muted">{active.category} · {fmtDate(active.date)} · by {active.by || '—'}</p></div>
              <div className="row">
                <button className="icon-btn dark" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out"><Minus size={15} /></button>
                <span className="small" style={{ minWidth: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                <button className="icon-btn dark" onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))} aria-label="Zoom in"><Plus size={15} /></button>
                <button className="icon-btn dark" onClick={() => setRot((r) => (r + 90) % 360)} aria-label="Rotate"><RotateCw size={15} /></button>
                <button className="icon-btn dark" onClick={() => setFull((f) => !f)} aria-label="Toggle fullscreen">{full ? <Shrink size={15} /> : <Expand size={15} />}</button>
                <a className="icon-btn dark" href={active.src} download={active.name} aria-label="Download"><Download size={15} /></a>
                <button className="icon-btn dark danger" onClick={() => { onDelete?.(active.id); setActive(null) }} aria-label="Delete image"><Trash2 size={15} /></button>
                <button className="icon-btn dark" onClick={() => setActive(null)} aria-label="Close viewer"><X size={15} /></button>
              </div>
            </div>
            <motion.div
              className="viewer-stage"
              initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ duration: 0.25, ease: EASE }}
            >
              <motion.img
                src={active.src} alt={active.name} draggable={false}
                style={{ transform: `scale(${zoom}) rotate(${rot}deg)`, cursor: zoom > 1 ? 'grab' : 'default' }}
                drag={zoom > 1} dragConstraints={{ left: -160, right: 160, top: -120, bottom: 120 }}
                dragElastic={0.1}
              />
            </motion.div>
            <p className="viewer-hint small">Drag to pan when zoomed · scroll-free touch pinch coming to PWA</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Built-in demo scans (SVG data URIs — no backend files needed for the demo)
// eslint-disable-next-line react-refresh/only-export-components -- demo scan factory colocated with viewer
export function demoScans() {
  const pano = (label) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="300"><rect width="640" height="300" fill="#0b1220"/><text x="320" y="30" fill="#64748b" font-size="16" text-anchor="middle" font-family="sans-serif">${label}</text><g fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.85"><path d="M60 220 Q320 90 580 220"/></g><g fill="#e2e8f0">${Array.from({ length: 14 }, (_, i) => `<rect x="${90 + i * 34}" y="${150 + Math.abs(6 - i) * 9}" width="20" height="${44 - Math.abs(6 - i) * 4}" rx="6"/>`).join('')}</g><circle cx="320" cy="150" r="10" fill="#ef4444" opacity="0.8"/></svg>`,
  )
  return [
    { id: 'x1', name: 'Panoramic X-ray', category: 'xray', date: new Date(Date.now() - 20 * 864e5).toISOString(), src: pano('Panoramic · upper + lower arch'), by: 'Dr. Sofia Mendoza' },
    { id: 'x2', name: 'Periapical — #16', category: 'xray', date: new Date(Date.now() - 6 * 864e5).toISOString(), src: pano('Periapical · tooth #16'), by: 'Dr. Miguel Torres' },
  ]
}

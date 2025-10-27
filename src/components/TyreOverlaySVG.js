import React, { useMemo, useState } from "react";
import carSvg from "../assets/tyre-board-car.svg";

export default function TyreOverlaySVG({ form, setForm }) {
  const [active, setActive] = useState(null);

 // matches your tyre-board-car.svg size
const VB = { w: 1210, h: 828 };


  // Turn this to false later if you want to hide the visible guides
  const SHOW_GUIDES = true;

 const hotspots = useMemo(() => ({
  // Front tyres
  nsf:  { x: 340, y: 100, w: 86, h: 165, label: "Near-Side Front", idx: 0, pos: "Front Left"  },
  osf:  { x: 740, y: 100, w: 86, h: 165, label: "Off-Side Front",  idx: 1, pos: "Front Right" },

  // Rear tyres
  nsr:  { x: 340, y: 450, w: 86, h: 165, label: "Near-Side Rear",  idx: 2, pos: "Rear Left"   },
  osr:  { x: 740, y: 450, w: 86, h: 165, label: "Off-Side Rear",   idx: 3, pos: "Rear Right"  },

  // Spare (bottom center)
  spare:{ x: 545, y: 720, r: 58, label: "Spare (if present)" },
}), []);


  const td = (i) => (i != null ? form.tyres?.[i]?.treadDepth || "" : "");
  const wc = (i) => (i != null ? form.tyres?.[i]?.condition || "" : "");

  const save = (id, depth, condition) => {
    const h = hotspots[id];
    if (h.idx == null) return;
    const t = [...(form.tyres || [])];
    t[h.idx] = { ...(t[h.idx] || {}), position: h.pos, treadDepth: depth, condition };
    setForm({ ...form, tyres: t });
    setActive(null);
  };

 return (
  <div className="tyre-stage">
    <svg className="tyre-svg" viewBox={`0 0 ${VB.w} ${VB.h}`} role="img" aria-label="Tyre diagram">
      {/* car image */}
      <image href={carSvg} x="0" y="0" width={VB.w} height={VB.h} />

      {/* ===== Visible guides (just to show where to click) ===== */}
      <>
        {["nsf", "osf", "nsr", "osr"].map((id) => {
          const h = hotspots[id];
          return (
            <g key={`g-${id}`} pointerEvents="none">
              <rect
                className="guide-rect"
                x={h.x} y={h.y} width={h.w} height={h.h} rx="10" ry="10"
              />
              <text
                className="guide-label"
                x={h.x + h.w / 2}
                y={h.y - 8}
                textAnchor="middle"
              >
                {id === "nsf" ? "NSF" : id === "osf" ? "OSF" : id === "nsr" ? "NSR" : "OSR"}
              </text>
            </g>
          );
        })}
        <g pointerEvents="none">
          <circle
            className="guide-circle"
            cx={hotspots.spare.x + hotspots.spare.r}
            cy={hotspots.spare.y + hotspots.spare.r}
            r={hotspots.spare.r}
          />
          <text
            className="guide-label"
            x={hotspots.spare.x + hotspots.spare.r}
            y={hotspots.spare.y - 6}
            textAnchor="middle"
          >
            Spare
          </text>
        </g>
      </>

      {/* ===== Actual clickable hotspots (TOP layer) ===== */}
      <rect
        className="hotspot"
        x={hotspots.nsf.x} y={hotspots.nsf.y} width={hotspots.nsf.w} height={hotspots.nsf.h}
        rx="10" onClick={() => setActive("nsf")}
        fill="transparent"
      />
      <rect
        className="hotspot"
        x={hotspots.osf.x} y={hotspots.osf.y} width={hotspots.osf.w} height={hotspots.osf.h}
        rx="10" onClick={() => setActive("osf")}
        fill="transparent"
      />
      <rect
        className="hotspot"
        x={hotspots.nsr.x} y={hotspots.nsr.y} width={hotspots.nsr.w} height={hotspots.nsr.h}
        rx="10" onClick={() => setActive("nsr")}
        fill="transparent"
      />
      <rect
        className="hotspot"
        x={hotspots.osr.x} y={hotspots.osr.y} width={hotspots.osr.w} height={hotspots.osr.h}
        rx="10" onClick={() => setActive("osr")}
        fill="transparent"
      />
      <circle
        className="hotspot"
        cx={hotspots.spare.x + hotspots.spare.r}
        cy={hotspots.spare.y + hotspots.spare.r}
        r={hotspots.spare.r}
        onClick={() => setActive("spare")}
        fill="transparent"
      />
    </svg>

    {/* Popup (unchanged) */}
    {active && (
      <div className={`tyre-popup tp-${active}`} onClick={(e) => e.stopPropagation()}>
        <div className="tp-title">{hotspots[active].label}</div>
        {active === "spare" ? (
          <input className="tp-input" placeholder="e.g., Space Saver, Missing" />
        ) : (
          <>
            <label className="tp-label">Tread Depth (mm)</label>
            <select className="tp-input" defaultValue={td(hotspots[active].idx)} id="tp-depth">
              <option value="">Select</option>
              <option value="1.6">1.6 (Legal Min)</option>
              <option value="3">3</option><option value="4">4</option>
              <option value="5">5</option><option value="6">6</option>
              <option value="7">7</option><option value="8">8 (New)</option>
            </select>

            <label className="tp-label">Wheel Condition</label>
            <input className="tp-input" defaultValue={wc(hotspots[active].idx)} id="tp-cond" placeholder="e.g., Scuffs, Dents" />

            <div className="tp-actions">
              <button
                type="button"
                className="btn tp-save"
                onClick={() => {
                  const depth = document.getElementById("tp-depth").value;
                  const cond  = document.getElementById("tp-cond").value;
                  save(active, depth, cond);
                }}
              >Save</button>
              <button type="button" className="btn tp-cancel" onClick={() => setActive(null)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    )}
  </div>
);

}

import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * "Bay 04 — monitor": the live half of the hero. A running ECG trace and a
 * readout that drifts the way a real monitor's does, so the panel reads as
 * something currently happening rather than a screenshot.
 *
 * The numbers are decorative, not data — they are never presented as a
 * patient's, and they hold still under prefers-reduced-motion, where a
 * number changing under you is exactly the thing to avoid.
 */
export function VitalsMonitor() {
  const reduced = useReducedMotion();
  const [vitals, setVitals] = useState({ hr: 72, spo2: 98 });

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setVitals({
        hr: 70 + Math.round(Math.random() * 6),
        spo2: 97 + Math.round(Math.random()),
      });
    }, 1400);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div
      className="absolute w-[15rem] rounded-xl border border-line py-[0.85rem] px-[0.9rem] backdrop-blur-[6px] shadow-[0_28px_60px_-40px_rgba(22,22,15,0.5)]"
      style={{
        right: "3%",
        top: "45%",
        background: "rgba(255,255,255,0.92)",
        animation: "mf-rise 1s var(--ease-out-quint) 1.1s both",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.62rem] font-medium tracking-[0.09em] uppercase text-muted">
          Bay 04 — monitor
        </span>
        <span className="size-[6px] shrink-0 rounded-full bg-sage a-blip" />
      </div>

      <div className="mt-2 h-[2.6rem] overflow-hidden text-sage">
        <div className="w-[200%] h-full a-trace-run" style={{ animationDuration: "2.2s" }}>
          <svg
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
            fill="none"
            className="w-full h-full block"
          >
            <path
              d="M0,34 L28,34 L36,20 L44,50 L52,34 L86,34 L94,28 L102,34 L140,34 L160,34 L168,20 L176,50 L184,34 L218,34 L226,28 L234,34 L272,34 L292,34 L300,20 L308,50 L316,34 L350,34 L358,28 L366,34 L400,34"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-baseline gap-[1.1rem] mt-[0.35rem]">
        <span className="font-mono text-[1.15rem] text-ink tabular">
          {vitals.hr}
          <span className="text-[0.6rem] text-muted ml-0.5">bpm</span>
        </span>
        <span className="font-mono text-[1.15rem] text-info tabular">
          {vitals.spo2}
          <span className="text-[0.6rem] text-muted ml-0.5">SpO₂</span>
        </span>
      </div>
    </div>
  );
}

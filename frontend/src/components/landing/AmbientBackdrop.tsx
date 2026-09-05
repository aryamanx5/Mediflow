/**
 * The hero's background, pulled out of Hero.tsx so that file stays about
 * layout rather than decoration. Three layers, back to front:
 *
 *   1. the base wash        — the original vertical gradient, unchanged
 *   2. two drifting tints   — slow, wide, barely-there colour movement
 *   3. a clinical texture   — the same plus-mark motif as the dashboard,
 *                             at a fraction of its opacity, so the two
 *                             registers read as one product
 *
 * All three sit at -z-10 inside the hero's own stacking context, painted in
 * this order (later siblings paint on top), well behind the type and figure.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(178deg, #f6f4ef 0%, #f2efe8 52%, #eae7de 100%)",
        }}
      />

      <div
        className="absolute -left-[10%] -top-[18%] size-[52%] min-w-80 rounded-full a-drift"
        style={{
          background:
            "radial-gradient(circle, rgba(79,97,82,0.10) 0%, rgba(79,97,82,0) 68%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -right-[6%] top-[38%] size-[46%] min-w-72 rounded-full a-drift"
        style={{
          background:
            "radial-gradient(circle, rgba(63,90,107,0.09) 0%, rgba(63,90,107,0) 70%)",
          filter: "blur(44px)",
          animationDelay: "-6s",
          animationDuration: "20s",
        }}
      />
      <div
        className="absolute left-[18%] bottom-[-14%] size-[38%] min-w-64 rounded-full a-drift"
        style={{
          background:
            "radial-gradient(circle, rgba(156,107,79,0.07) 0%, rgba(156,107,79,0) 70%)",
          filter: "blur(38px)",
          animationDelay: "-11s",
          animationDuration: "24s",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2752%27%20height%3D%2752%27%3E%3Cpath%20d%3D%27M26%2017v18M17%2026h18%27%20stroke%3D%27rgba%2879%2C97%2C82%2C0.05%29%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E\")",
          backgroundSize: "52px 52px",
        }}
      />

      {/* ward light: two beams crossing the room, minutes apart */}
      <div
        className="absolute -top-[20%] -bottom-[20%] w-[26%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
          mixBlendMode: "soft-light",
          animation: "mf-beam 26s linear infinite",
        }}
      />
      <div
        className="absolute -top-[20%] -bottom-[20%] w-[14%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(228,233,225,0) 0%, rgba(228,233,225,0.9) 50%, rgba(228,233,225,0) 100%)",
          mixBlendMode: "soft-light",
          animation: "mf-beam 34s linear -14s infinite",
        }}
      />

      {/* the floor trace: drawn in once, then running for as long as the page
          is open. Two identical periods sit inside a 200%-wide track, so
          translating it half its width loops seamlessly. */}
      <div className="absolute inset-x-0 bottom-0 h-9 overflow-hidden opacity-[0.28] text-sage">
        <div className="absolute inset-0 w-[200%] a-trace-run" style={{ animationDuration: "6s" }}>
          <svg
            viewBox="0 0 2400 60"
            preserveAspectRatio="none"
            fill="none"
            className="w-full h-full block"
          >
            <path
              d="M0,30 L40,30 L52,14 L64,46 L76,30 L120,30 L132,22 L144,30 L200,30 L240,30 L252,14 L264,46 L276,30 L320,30 L332,22 L344,30 L400,30 L440,30 L452,14 L464,46 L476,30 L520,30 L532,22 L544,30 L600,30 L640,30 L652,14 L664,46 L676,30 L720,30 L732,22 L744,30 L800,30 L840,30 L852,14 L864,46 L876,30 L920,30 L932,22 L944,30 L1000,30 L1040,30 L1052,14 L1064,46 L1076,30 L1120,30 L1132,22 L1144,30 L1200,30 L1240,30 L1252,14 L1264,46 L1276,30 L1320,30 L1332,22 L1344,30 L1400,30 L1440,30 L1452,14 L1464,46 L1476,30 L1520,30 L1532,22 L1544,30 L1600,30 L1640,30 L1652,14 L1664,46 L1676,30 L1720,30 L1732,22 L1744,30 L1800,30 L1840,30 L1852,14 L1864,46 L1876,30 L1920,30 L1932,22 L1944,30 L2000,30 L2040,30 L2052,14 L2064,46 L2076,30 L2120,30 L2132,22 L2144,30 L2200,30 L2240,30 L2252,14 L2264,46 L2276,30 L2320,30 L2332,22 L2344,30 L2400,30"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="a-pulse-draw"
              style={{ "--pulse-length": 3000, animationDelay: "0.5s" } as React.CSSProperties}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

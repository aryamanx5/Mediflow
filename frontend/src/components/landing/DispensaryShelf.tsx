/**
 * A dispensary shelf tracking slowly past behind the inventory panel. Three
 * identical runs sit side by side and the track slides exactly one third of
 * its width, so the loop has no seam.
 *
 * Decorative only — boxes, not data.
 */
const BOXES = [
  { w: "3.5rem", bg: "#e4e9e1", border: "rgba(79,97,82,0.16)" },
  { w: "2.5rem", bg: "#f0e5dd", border: "rgba(156,107,79,0.16)" },
  { w: "4.25rem", bg: "#ffffff", border: "#e3dfd5" },
  { w: "3rem", bg: "#e2eaee", border: "rgba(63,90,107,0.16)" },
  { w: "5rem", bg: "#e4e9e1", border: "rgba(79,97,82,0.16)" },
  { w: "2.75rem", bg: "#ffffff", border: "#e3dfd5" },
  { w: "3.75rem", bg: "#f0e5dd", border: "rgba(156,107,79,0.16)" },
  { w: "3.25rem", bg: "#e2eaee", border: "rgba(63,90,107,0.16)" },
];

export function DispensaryShelf() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 h-full overflow-hidden opacity-50 pointer-events-none"
    >
      <div
        className="absolute top-[22%] left-0 w-[300%] flex gap-5"
        style={{ animation: "mf-shelf 44s linear infinite" }}
      >
        {[0, 1, 2].map((run) => (
          <div key={run} className="flex gap-5">
            {BOXES.map((b, i) => (
              <span
                key={i}
                className="h-20 rounded-sm border shrink-0"
                style={{ width: b.w, background: b.bg, borderColor: b.border }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* fade the shelf back into the section's own ground */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,#efece4 0%, rgba(239,236,228,0.72) 30%, rgba(239,236,228,0.92) 100%)",
        }}
      />
    </div>
  );
}

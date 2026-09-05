/**
 * Three small medical marks in the space around the doctor — never over the
 * face, which stays perfectly still (see DoctorStage). These, the IV drip and
 * the pharmacy objects are what actually move near the figure, each on its
 * own phase so they never line up.
 *
 * Positions and tints are the design handoff's (Landing.dc.html), measured
 * against the same box the doctor image fills.
 */
export function FloatingBadges() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <Badge top="6%" left="22%" tone="sage" duration="6.5s" delay="0s">
        <PulseIcon />
      </Badge>
      <Badge top="34%" right="6%" tone="clay" duration="7.2s" delay="-2.4s">
        <CrossIcon />
      </Badge>
      <Badge bottom="11%" left="34%" tone="info" duration="5.8s" delay="-4.1s">
        <RxGlyph />
      </Badge>
    </div>
  );
}

const TONE = {
  sage: "bg-sage-tint text-sage border-sage/15",
  clay: "bg-clay-tint text-clay border-clay/15",
  info: "bg-info-tint text-info border-info/15",
} as const;

function Badge({
  children,
  top,
  bottom,
  left,
  right,
  tone,
  delay,
  duration,
}: {
  children: React.ReactNode;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  tone: keyof typeof TONE;
  delay: string;
  duration: string;
}) {
  return (
    <div
      className={`absolute size-[2.75rem] rounded-full border grid place-items-center shadow-[0_10px_24px_-14px_rgba(22,22,15,0.35)] ${TONE[tone]}`}
      style={{
        top,
        bottom,
        left,
        right,
        animation: `mf-float-soft ${duration} ease-in-out ${delay} infinite`,
      }}
    >
      {children}
    </div>
  );
}

function PulseIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M1.5 10.5h4l1.8-4.5 3 8.5 2-6.5 1.5 2.5h4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function RxGlyph() {
  return <span className="u-serif text-[0.86rem] font-medium leading-none">Rx</span>;
}

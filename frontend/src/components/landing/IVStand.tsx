/**
 * The IV stand beside the figure — a bag, a line, and two drops falling half
 * a cycle apart so the drip never looks metronomic. Purely decorative.
 */
export function IVStand() {
  return (
    <div
      className="absolute w-[2.4rem]"
      style={{
        left: "22%",
        bottom: "9%",
        animation: "mf-rise 1s var(--ease-out-quint) 1.35s both",
      }}
    >
      {/* the bag, half-full */}
      <div
        className="w-[2.1rem] h-[3.4rem] rounded-t-[0.35rem] rounded-b-[0.6rem] border"
        style={{
          background:
            "linear-gradient(180deg, rgba(207,216,207,0.6) 0%, rgba(207,216,207,0.4) 30%, rgba(125,144,127,0.85) 31%, rgba(125,144,127,0.95) 100%)",
          borderColor: "rgba(79,97,82,0.22)",
        }}
      />

      {/* the line, with two drops out of phase */}
      <div
        className="relative mx-auto w-px h-24"
        style={{ background: "linear-gradient(180deg,#a5a091,rgba(165,160,145,0))" }}
      >
        <div
          className="absolute -left-0.5 top-0 w-[5px] h-[7px] rounded-full"
          style={{ background: "#7d907f", animation: "mf-drop 2.6s cubic-bezier(0.45,0,0.9,0.6) infinite" }}
        />
        <div
          className="absolute -left-0.5 top-0 w-[5px] h-[7px] rounded-full"
          style={{ background: "#7d907f", animation: "mf-drop 2.6s cubic-bezier(0.45,0,0.9,0.6) -1.3s infinite" }}
        />
      </div>
    </div>
  );
}

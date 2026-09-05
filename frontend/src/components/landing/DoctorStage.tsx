import { DOCTOR_SRC } from "../../assets/doctor/config";
import { DoctorPlaceholder } from "./DoctorPlaceholder";

/**
 * The doctor composition.
 *
 * Deliberately static. An earlier version tracked the cursor in three planes
 * — head leading, shoulders following, body barely moving — but any movement
 * of the face reads as the portrait warping rather than as the doctor
 * noticing you, so the figure is now the one fixed point in the hero. All of
 * the cursor response lives in the objects around him instead (see
 * PharmacyObjects), which is where parallax actually reads as depth.
 *
 * `dim`: the auth panel sits this on top of a corridor photo rather than a
 * flat wash, so the landing hero's backdrop halo would sit too heavy there.
 * Auth asks for the fainter pairing the design handoff specifies and drops
 * the soft key light entirely (the reference has no equivalent layer).
 */
export function DoctorStage({ dim = false }: { dim?: boolean }) {
  return (
    <div className="relative w-full h-full select-none">
      {/* backdrop: a warm halo the figure stands against */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: dim
            ? "radial-gradient(58% 52% at 50% 38%, rgba(228,233,225,0.55) 0%, rgba(239,236,228,0.25) 45%, rgba(246,244,239,0) 72%)"
            : "radial-gradient(58% 52% at 50% 38%, rgba(228,233,225,0.95) 0%, rgba(239,236,228,0.6) 45%, rgba(246,244,239,0) 72%)",
        }}
      />

      {/* soft key light, fixed rather than pointer-tracked — omitted over a
          photo backdrop, where the corridor's own light already reads */}
      {!dim && (
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            background:
              "radial-gradient(34% 30% at 46% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      )}

      {/* the figure */}
      <div className="absolute inset-0">
        {DOCTOR_SRC ? (
          <img
            src={DOCTOR_SRC}
            alt="A physician in a white medical coat"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-contain object-bottom"
          />
        ) : (
          <DoctorPlaceholder className="absolute inset-0 size-full" />
        )}
      </div>

      {/* grounding shadow so the figure sits on the page rather than floating */}
      <div
        aria-hidden
        className="absolute inset-x-[18%] bottom-0 h-24"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 100%, rgba(22,22,15,0.13) 0%, rgba(22,22,15,0) 70%)",
        }}
      />
    </div>
  );
}

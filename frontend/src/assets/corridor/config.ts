/**
 * Auth panel corridor photo
 * =========================
 *
 * TO INSTALL:
 *   Drop one file into this folder named `corridor.jpg` / `.webp` / `.avif` /
 *   `.png`. Nothing else needs editing — AuthLayout picks it up automatically
 *   and the ken-burns/light-beam treatment applies to it directly.
 *
 * ASSET GUIDANCE:
 *   - Landscape, well-lit, roughly 1600x1200 or larger — it's shown
 *     `object-cover` behind a translucent wash, so detail past the edges is
 *     fine to lose.
 *   - Keep the busiest part of the frame (signage, people, a desk) away from
 *     the top-right and bottom-left corners: that's where the "Ward 02" card
 *     and the cross badge sit.
 *
 * Same format-preference pattern as ../doctor/config.ts.
 */

const found = import.meta.glob<string>(
  "./corridor.{avif,webp,png,jpg,jpeg}",
  { eager: true, query: "?url", import: "default" },
);

const PREFERENCE = [".avif", ".webp", ".jpg", ".jpeg", ".png"];

const best = Object.entries(found).sort(
  ([a], [b]) =>
    PREFERENCE.findIndex((ext) => a.endsWith(ext)) -
    PREFERENCE.findIndex((ext) => b.endsWith(ext)),
)[0];

/** The installed photo, or null while no file has been dropped in yet. */
export const CORRIDOR_SRC: string | null = best?.[1] ?? null;

/**
 * Doctor asset configuration
 * ==========================
 *
 * TO INSTALL THE PHOTO:
 *   Drop one file into this folder named `doctor.png` / `.webp` / `.avif` /
 *   `.jpg`. Nothing else needs editing — it is picked up automatically and
 *   replaces the placeholder silhouette.
 *
 * ASSET GUIDANCE:
 *   - Cut out, transparent background (PNG/WebP/AVIF). A JPEG works but the
 *     rectangular edge will be visible against the hero.
 *   - Portrait or 3/4 body, roughly 1200x1600 or larger.
 *   - Head positioned in the upper third; leave a little headroom.
 *
 * THE HEAD BOX:
 *   The hero renders the photo twice — once as the body, once clipped to the
 *   region below and offset slightly further. That second copy is what makes
 *   the head and gaze lead the shoulders instead of the whole figure sliding
 *   as one flat card.
 *
 *   Values are fractions (0..1, from the top-left) of the *rendered container*,
 *   not of the image file. The photo is object-contain and bottom-aligned
 *   inside that container, so re-check these after swapping in an image with a
 *   noticeably different aspect ratio. Widen `feather` if you can see a seam.
 */
export const HEAD_BOX = {
  // Tuned for the installed 1024x1536 portrait: hair crown down through the
  // collar, framing the head and neck but stopping above the shoulders.
  top: 0.005,
  bottom: 0.255,
  left: 0.245,
  right: 0.625,
  /** Soft edge on the clip, as a fraction of the image's box. */
  feather: 0.045,
};


const found = import.meta.glob<string>(
  "./doctor.{png,webp,avif,jpg,jpeg}",
  { eager: true, query: "?url", import: "default" },
);

// Pick by format quality, not by whatever order the glob happens to return, so
// dropping in a .png beside an existing .webp does not silently downgrade the
// hero to the heavier file.
const PREFERENCE = [".avif", ".webp", ".png", ".jpg", ".jpeg"];

const best = Object.entries(found).sort(
  ([a], [b]) =>
    PREFERENCE.findIndex((ext) => a.endsWith(ext)) -
    PREFERENCE.findIndex((ext) => b.endsWith(ext)),
)[0];

/** The installed photo, or null while the placeholder is in use. */
export const DOCTOR_SRC: string | null = best?.[1] ?? null;

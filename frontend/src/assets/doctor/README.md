# Doctor asset slot

Drop the photorealistic doctor here as **`doctor.png`** (or `.webp` / `.avif` /
`.jpg`). It is detected automatically at build time — no import to edit.

Until a file is present the hero renders a neutral placeholder silhouette with
the full layered rig already wired, so the interaction can be reviewed before
the photo exists.

After installing the photo, open `config.ts` and nudge `HEAD_BOX` so the box
frames the head and upper neck. That box is what lets the head lead the
shoulders on cursor movement.

Recommended: cut out on transparency, 3/4 body, ≥1200×1600, head in the upper
third.

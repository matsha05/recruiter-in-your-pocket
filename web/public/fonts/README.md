# Self-hosted product fonts

Two families, both SIL OFL 1.1, each folder with its upstream license (Highlighter system, October 30, 2026). Browser files are the variable WOFF2s; the static WOFF cuts feed renderers that cannot read WOFF2 (the share images and icons through Next ImageResponse/Satori). The PDF embeds the same WOFF2 faces.

- **Schibsted Grotesk**: headlines and the interface. `SchibstedGrotesk-Variable.woff2`, `SchibstedGrotesk-Italic-Variable.woff2` (400–900), plus static Regular, Semibold and ExtraBold WOFF cuts.
- **Literata**: the recruiter's voice. `Literata-Variable.woff2`, `Literata-Italic-Variable.woff2` (200–900), plus static Regular and Italic WOFF cuts. The homepage share card draws its illustrated resume in Literata Regular; no other serif ships.

The Alpine-era families (Instrument Sans, Source Serif 4, Satoshi, Sentient) were removed on November 2, 2026. No runtime font CDN is allowed; generated outputs load local files only, and HTML email uses Arial and Georgia fallbacks.

# Self-hosted product fonts

Normal styles only. Both families are licensed under SIL OFL 1.1; each family directory includes its upstream license. Browser files are Latin-subset WOFF2s. PDF variables are full upstream TTFs; static TTFs support Next ImageResponse/Satori.

- **Instrument Sans**: weight 400–700, width 75–100. Variable TTF and OFL from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/instrumentsans); WOFF2 from the installed `@fontsource-variable/instrument-sans` 5.2.8 package (`instrument-sans-latin-wdth-normal.woff2`, Google Fonts source). Existing regular and semibold static TTFs were retained after validating their family metadata.
- **Source Serif 4**: weight 200–900, optical size 8–60. Variable TTF and OFL from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/sourceserif4). Latin variable WOFF2 from the official [Google Fonts CSS](https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap), `vEFI2_tTDB4M7-auWDN0ahZJW1gb8te1Xb7G.woff2`. Static regular TTF from [Adobe Source Serif](https://github.com/adobe-fonts/source-serif/blob/release/TTF/SourceSerif4-Regular.ttf).

Acquired September 5, 2026. Generated outputs load local TTFs only; no external font request is required at render time. HTML email uses Arial and Georgia fallbacks without external requests.

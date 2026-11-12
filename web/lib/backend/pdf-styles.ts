/** Print-specific Alpine identity. Keep paper white and evidence text readable. */
export function pdfReportStyles(fonts: { voice: string; voiceItalic: string; ui: string }): string {
  return `
    @font-face {
      font-family: "Literata";
      src: url(data:font/woff2;base64,${fonts.voice}) format("woff2");
      font-style: normal;
      font-weight: 200 900;
      font-display: block;
    }
    @font-face {
      font-family: "Literata";
      src: url(data:font/woff;base64,${fonts.voiceItalic}) format("woff");
      font-style: italic;
      font-weight: 400;
      font-display: block;
    }
    @font-face {
      font-family: "Schibsted Grotesk";
      src: url(data:font/woff2;base64,${fonts.ui}) format("woff2");
      font-style: normal;
      font-weight: 400 900;
      font-display: block;
    }
    :root {
      --page: #ffffff;
      --ink: #111513;
      --muted: #5a605c;
      --line: #dfe0dc;
      --accent: #1f5a46;
      --tint: #e6efeb;
      --inset: #f4f4f1;
      --brass: #6b5400;
      --miss-surface: #fff6c2;
      --miss-line: #f2dc6b;
      --red-pen: #b42318;
      --blue-ink: #2448a8;
      --highlight: #ffe14d;
    }
    @page { size: A4; margin: 18mm 17mm 16mm; background: var(--page); }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: var(--page); }
    body {
      font-family: "Schibsted Grotesk", Arial, sans-serif;
      color: var(--ink);
      font-size: 11pt;
      line-height: 16pt;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow-wrap: anywhere;
    }
    p, li { orphans: 3; widows: 3; }
    strong { font-weight: 600; }
    header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 22px; padding-bottom: 14px;
      border-bottom: 1px solid var(--ink);
    }
    .brand-wordmark { font-family: "Schibsted Grotesk", Arial, sans-serif; font-size: 15pt; font-weight: 800; line-height: 20pt; letter-spacing: -0.015em; }
    .brand-in { font-family: "Literata", Georgia, serif; font-style: italic; font-weight: 400; letter-spacing: 0; color: var(--accent); }
    .tagline { margin-top: 4px; font-size: 9pt; color: var(--muted); }
    .date { font-size: 9pt; line-height: 13pt; color: var(--muted); text-align: right; }
    .hero { padding-bottom: 20px; margin-bottom: 20px; break-inside: avoid; }
    .section-kicker {
      color: var(--accent); font-size: 9pt; font-weight: 600; line-height: 13pt;
      letter-spacing: 0.035em; margin-bottom: 6px; break-after: avoid;
    }
    h1 {
      font-family: "Literata", Georgia, serif;
      font-size: 18pt; font-weight: 400; line-height: 24pt;
      font-optical-sizing: auto; letter-spacing: -0.012em;
    }
    .verdict-rest { font-family: "Literata", Georgia, serif; font-size: 13pt; line-height: 19pt; margin-top: 6px; }
    h2 { font-size: 14pt; font-weight: 600; line-height: 18pt; letter-spacing: -0.018em; break-after: avoid; }
    .hero-summary { margin-top: 13px; }
    .score-note { border-top: 1px solid var(--line); color: var(--muted); font-size: 9pt; line-height: 13pt; margin-top: 18px; padding-top: 10px; }
    .verdict-label { color: var(--accent); font-size: 9pt; font-weight: 600; letter-spacing: 0.08em; line-height: 13pt; text-transform: uppercase; margin-bottom: 8px; }
    .keep-section { margin-bottom: 26px; }
    .section { margin-bottom: 26px; }
    .section-header { margin-bottom: 13px; padding-bottom: 9px; border-bottom: 1px solid var(--line); break-after: avoid; }
    ul { list-style: none; margin: 0; padding: 0; }
    li { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 11px; break-inside: avoid; }
    .checkbox { width: 11px; height: 11px; border: 1px solid var(--accent); flex: 0 0 11px; margin-top: 5px; }
    .signal-marker { width: 5px; height: 5px; flex: 0 0 5px; margin-top: 8px; border-radius: 50%; }
    .signal-marker.lands { background: var(--accent); }
    .signal-marker.context { border: 1px solid var(--ink); }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 26px; }
    .signal-panel { padding-top: 12px; border-top: 1px solid var(--line); }
    .signal-panel h2 { margin-bottom: 13px; }
    .priority-section { padding-top: 12px; border-top: 1px solid var(--accent); }
    .priority-section .section-header { border: 0; padding-bottom: 0; }
    .count-lead { margin-top: 5px; color: var(--muted); font-size: 10pt; line-height: 15pt; }
    /* The marked page, as on the web: the candidate's line on the left, the recruiter's note in the margin. */
    .band { margin-top: 16px; max-width: 360px; }
    .band-name { font-weight: 600; }
    .band-scale { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; margin-top: 6px; }
    .band-bar { height: 4px; border-radius: 2px; background: var(--line); }
    .band-bar.current { background: var(--ink); }
    .band-anchor { margin-top: 6px; color: var(--muted); font-size: 10pt; line-height: 15pt; }
    .marked-row { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 22px; border-top: 1px solid var(--line); padding: 13px 0; break-inside: avoid; }
    .marked-row:first-child { border-top: 0; }
    .marked-section { color: var(--muted); font-size: 9pt; line-height: 13pt; margin-bottom: 4px; }
    .marked-line { font-family: "Literata", Georgia, serif; font-size: 11.5pt; line-height: 17pt; }
    .marked-line.ink { border-left: 2px solid var(--blue-ink); padding-left: 10px; }
    .marked-revised { margin-top: 10px; border-left: 2px solid var(--blue-ink); padding-left: 10px; }
    .marked-revised-label { color: var(--accent); font-size: 9pt; font-weight: 600; line-height: 13pt; }
    .marked-revised-text { font-family: "Literata", Georgia, serif; font-size: 11pt; line-height: 16pt; margin-top: 2px; }
    .marked-revised-note { color: var(--muted); font-size: 9pt; line-height: 13pt; margin-top: 2px; }
    .marked-missing { border: 1px dashed var(--muted); border-radius: 6px; padding: 6px 10px; color: var(--muted); font-size: 10.5pt; line-height: 15pt; }
    .marked-missing.miss { border-color: var(--miss-line); background: var(--miss-surface); color: var(--brass); }
    .miss-mark { background: linear-gradient(transparent 52%, var(--highlight) 52%); -webkit-box-decoration-break: clone; box-decoration-break: clone; }
    .marked-label { color: var(--accent); font-size: 9pt; font-weight: 600; line-height: 13pt; }
    .marked-label.miss { color: var(--brass); letter-spacing: 0.08em; text-transform: uppercase; }
    .marked-definition { font-size: 9pt; font-weight: 600; line-height: 13pt; margin-bottom: 5px; }
    .pen-note { border-left: 1px solid var(--accent); padding-left: 8px; color: var(--accent); font-family: "Literata", Georgia, serif; font-style: italic; font-size: 10.5pt; line-height: 15pt; }
    .marked-why { margin-top: 5px; color: var(--muted); font-size: 10pt; line-height: 14pt; }
    .marked-questions { margin-top: 6px; }
    .marked-questions-label { color: var(--red-pen); font-size: 9pt; font-weight: 600; line-height: 13pt; }
    .marked-question { font-size: 10pt; line-height: 14pt; }
    .page-note { margin: 4px 0 12px; padding-left: 12px; border-left: 2px solid var(--accent); break-inside: avoid; }
    .page-note.gap { border-left-color: var(--red-pen); }
    .page-note-label { color: var(--accent); font-size: 9pt; font-weight: 600; line-height: 13pt; margin-bottom: 3px; }
    .page-note.gap .page-note-label { color: var(--red-pen); }
    .rewrite-card { border: 1px solid var(--line); margin-bottom: 16px; break-inside: avoid; }
    .rewrite-heading { display: flex; justify-content: space-between; gap: 14px; color: var(--muted); font-size: 9pt; line-height: 13pt; padding: 10px 13px; border-bottom: 1px solid var(--line); }
    .rewrite-grid { display: grid; grid-template-columns: 1fr 1fr; }
    .col { padding: 13px 14px 16px; }
    .col.original { border-right: 1px solid var(--line); }
    .col.better { background: var(--tint); }
    .col-label { font-size: 9pt; line-height: 13pt; margin-bottom: 9px; color: var(--muted); font-weight: 600; }
    .content { font-size: 11pt; line-height: 16pt; }
    .note { padding: 12px 14px; background: var(--inset); font-size: 11pt; line-height: 16pt; color: var(--ink); }
    .note strong { display: block; font-size: 9pt; line-height: 13pt; margin-bottom: 4px; }
    .section > .note { margin-bottom: 16px; break-inside: avoid; break-after: avoid; }
    .rewrite-card > .note { border-top: 1px solid var(--line); }
    .tag-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; margin-top: 10px; }
    .tag-label { color: var(--muted); font-size: 10pt; margin-right: 5px; }
    .tag { display: inline-block; padding: 3px 8px; border: 1px solid var(--line); border-radius: 3px; font-size: 10pt; line-height: 14pt; }
    .positioning-suggestion { margin: 16px 0; padding-left: 15px; border-left: 2px solid var(--accent); }
    .positioning-suggestion p { font-size: 11pt; line-height: 16pt; }
    .alignment-meta { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-top: 15px; padding-top: 12px; border-top: 1px solid var(--line); font-size: 10pt; line-height: 15pt; }
    .meta-item strong { margin-right: 4px; }
    .alignment-section { padding-top: 12px; border-top: 1px solid var(--line); break-inside: avoid; }
    /* The worklist report (Nov 5, 2026): the score beside its rung, the write-up in the pen, one card per line. */
    .score-row { display: flex; align-items: flex-start; gap: 22px; margin-bottom: 14px; }
    .score { font-size: 30pt; font-weight: 800; line-height: 30pt; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
    .score-row .band { margin-top: 2px; }
    .first-pass { margin-top: 14px; }
    .pass-title { color: var(--accent); font-size: 9pt; font-weight: 600; line-height: 13pt; }
    .pass-lead { color: var(--muted); font-size: 9pt; line-height: 13pt; }
    .sort { display: flex; margin-top: 8px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); break-inside: avoid; }
    .sort > div { flex: 1 1 0; padding: 8px 12px 8px 0; }
    .sort > div + div { padding-left: 12px; border-left: 1px solid var(--line); }
    .sort-q { color: var(--muted); font-size: 8.5pt; font-weight: 600; line-height: 12pt; }
    .sort-a { font-size: 10.5pt; font-weight: 600; line-height: 15pt; margin-top: 2px; }
    .sort-why { color: var(--accent); font-family: "Literata", Georgia, serif; font-style: italic; font-size: 10pt; line-height: 14pt; margin-top: 2px; }
    .posting-fit { margin-top: 10px; break-inside: avoid; }
    .posting-fit .note { color: var(--accent); font-family: "Literata", Georgia, serif; font-size: 11pt; line-height: 16pt; }
    .posting-fit ul { margin: 6px 0 0 16px; padding: 0; font-size: 10pt; line-height: 14pt; }
    .posting-fit .label { font-size: 9pt; font-weight: 600; line-height: 13pt; margin-top: 8px; }
    .posting-fit .how { color: var(--muted); font-size: 9pt; line-height: 13pt; margin-top: 4px; }
    .stop { margin-top: 10px; padding-top: 8px; border-top: 2px solid var(--red-pen); break-inside: avoid; }
    .stop-title { color: var(--red-pen); font-size: 9.5pt; font-weight: 600; line-height: 13pt; }
    .stop-line { margin-top: 6px; border: 1px solid var(--line); border-radius: 4px; padding: 6px 10px; font-family: "Literata", Georgia, serif; font-size: 10.5pt; line-height: 15pt; text-decoration: line-through; text-decoration-color: var(--red-pen); }
    .stop-note { margin-top: 6px; font-size: 10pt; line-height: 14pt; }
    .write-up { margin-top: 14px; color: var(--accent); font-family: "Literata", Georgia, serif; font-size: 11.5pt; line-height: 17pt; }
    .write-up p + p { margin-top: 9px; }
    .card { border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; break-inside: avoid; }
    .card.keep { border-color: var(--accent); }
    .card-where { color: var(--brass); font-size: 9pt; font-weight: 600; line-height: 13pt; margin-bottom: 7px; }
    .card.keep .card-where { color: var(--accent); }
    .card-where-quiet { margin-left: 8px; color: var(--muted); font-weight: 400; }
    .card-line { font-family: "Literata", Georgia, serif; font-size: 11.5pt; line-height: 17pt; margin-bottom: 8px; }
    .card-line.ink { border-left: 2px solid var(--blue-ink); padding-left: 10px; }
    .card-statement { border: 1px dashed var(--accent); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; color: var(--accent); font-family: "Literata", Georgia, serif; font-style: italic; font-size: 10.5pt; line-height: 15pt; }
    .card .pen-note { margin-bottom: 8px; }
    .card-example { border-left: 2px solid var(--blue-ink); padding-left: 10px; font-family: "Literata", Georgia, serif; font-size: 11pt; line-height: 16pt; }
    .blank { color: var(--blue-ink); }
    .blank-filled { color: var(--blue-ink); text-decoration: underline; text-decoration-color: rgba(36, 72, 168, 0.45); }
    .card-example-note { margin-top: 2px; color: var(--muted); font-size: 9pt; line-height: 13pt; }
    .card-question { margin-top: 8px; font-size: 10.5pt; font-weight: 600; line-height: 15pt; }
    .unlisted { color: var(--muted); font-size: 9.5pt; line-height: 14pt; margin-top: 4px; }
    .marked-questions-label.accent { color: var(--accent); }
    footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; gap: 28px; font-size: 9pt; line-height: 13pt; color: var(--muted); }
  `;
}

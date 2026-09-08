/** Print-specific Alpine identity. Keep paper white and evidence text readable. */
export function pdfReportStyles(sourceSerifTtf: string, instrumentSansTtf: string): string {
  return `
    @font-face {
      font-family: "Source Serif 4";
      src: url(data:font/ttf;base64,${sourceSerifTtf}) format("truetype");
      font-style: normal;
      font-weight: 200 900;
      font-display: block;
    }
    @font-face {
      font-family: "Instrument Sans";
      src: url(data:font/ttf;base64,${instrumentSansTtf}) format("truetype");
      font-style: normal;
      font-weight: 400 700;
      font-stretch: 75% 100%;
      font-display: block;
    }
    :root {
      --page: #ffffff;
      --ink: #12191b;
      --muted: #5f6667;
      --line: #dcdedb;
      --accent: #00738f;
      --tint: #e6f3f2;
      --inset: #f0efeb;
    }
    @page { size: A4; margin: 18mm 17mm 16mm; background: var(--page); }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: var(--page); }
    body {
      font-family: "Instrument Sans", Arial, sans-serif;
      color: var(--ink);
      font-size: 11pt;
      line-height: 16pt;
      font-variant-numeric: tabular-nums;
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
    .brand-wordmark { font-size: 15pt; font-weight: 500; line-height: 20pt; letter-spacing: -0.025em; }
    .tagline { margin-top: 4px; font-size: 9pt; color: var(--muted); }
    .date { font-size: 9pt; line-height: 13pt; color: var(--muted); text-align: right; }
    .hero { padding-bottom: 20px; margin-bottom: 20px; break-inside: avoid; }
    .hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) 128px; gap: 28px; align-items: start; }
    .section-kicker {
      color: var(--accent); font-size: 9pt; font-weight: 600; line-height: 13pt;
      letter-spacing: 0.035em; margin-bottom: 6px; break-after: avoid;
    }
    h1 {
      font-family: "Source Serif 4", Georgia, serif;
      font-size: 18pt; font-weight: 400; line-height: 24pt;
      font-optical-sizing: auto; letter-spacing: -0.012em;
    }
    h2 { font-size: 14pt; font-weight: 500; line-height: 18pt; letter-spacing: -0.018em; break-after: avoid; }
    .hero-summary { margin-top: 13px; }
    .score-card { border-left: 1px solid var(--line); padding-left: 18px; }
    .score-name { font-size: 9pt; line-height: 13pt; color: var(--muted); margin-bottom: 9px; }
    .score-value { font-size: 34pt; font-weight: 400; line-height: 36pt; letter-spacing: -0.04em; }
    .score-value span { color: var(--muted); font-size: 11pt; letter-spacing: 0; }
    .score-band { font-size: 10pt; font-weight: 600; line-height: 14pt; margin-top: 8px; }
    .score-scale { color: var(--muted); font-size: 9pt; line-height: 13pt; margin-top: 6px; }
    .score-note { border-top: 1px solid var(--line); color: var(--muted); font-size: 9pt; line-height: 13pt; margin-top: 18px; padding-top: 10px; }
    .score-note strong { color: var(--ink); }
    .subscores-grid { display: grid; grid-template-columns: repeat(4, 1fr); margin-bottom: 26px; border-block: 1px solid var(--line); break-inside: avoid; }
    .subscore { padding: 12px 14px; border-right: 1px solid var(--line); }
    .subscore:first-child { padding-left: 0; }
    .subscore:last-child { border-right: 0; padding-right: 0; }
    .subscore-label { font-size: 9pt; line-height: 13pt; color: var(--muted); margin-bottom: 4px; }
    .subscore-value { font-size: 18pt; font-weight: 400; line-height: 23pt; }
    .metric-track { height: 2px; background: var(--line); margin-top: 8px; overflow: hidden; }
    .metric-fill { height: 100%; background: var(--accent); }
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
    .priority-list { display: block; }
    .priority-item { border-top: 1px solid var(--line); padding: 12px 0; margin: 0; }
    .priority-number { color: var(--accent); font-size: 10pt; line-height: 16pt; flex: 0 0 24px; }
    .priority-copy { display: flex; flex-direction: column; gap: 4px; }
    .priority-copy span { color: var(--muted); }
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
    footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; gap: 28px; font-size: 9pt; line-height: 13pt; color: var(--muted); }
  `;
}

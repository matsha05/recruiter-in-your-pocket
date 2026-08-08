export function pdfReportStyles(spaceGroteskTtf: string, instrumentSansTtf: string): string {
  return `
    @font-face {
      font-family: "Space Grotesk Variable";
      src: url(data:font/ttf;base64,${spaceGroteskTtf}) format("truetype");
      font-style: normal;
      font-weight: 200 800;
      font-display: block;
    }
    @font-face {
      font-family: "Instrument Sans Variable";
      src: url(data:font/ttf;base64,${instrumentSansTtf}) format("truetype");
      font-style: normal;
      font-weight: 400 700;
      font-stretch: 75% 100%;
      font-display: block;
    }
    :root {
      --page: #f7f5ef;
      --ink: #071722;
      --muted: #596570;
      --soft: #7c878e;
      --line: #ccd2d1;
      --control-line: #aeb8b7;
      --iris: #00738f;
      --iris-strong: #006784;
      --iris-tint: #d8f4fb;
      --sky: #e8f8fc;
      --sky-strong: #25bfea;
      --proof: #efede7;
      --apricot: #00738f;
      --butter: #c8f238;
      --butter-soft: #f3fad9;
      --white: #ffffff;
    }
    @page {
      size: A4;
      margin: 18mm 17mm 16mm;
      background: var(--page);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { background: var(--page); }
    body {
      font-family: "Instrument Sans Variable", Arial, sans-serif;
      color: var(--ink);
      background: var(--page);
      font-size: 9.5pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      font-variant-numeric: tabular-nums;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--ink);
    }
    .brand-wordmark {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      color: var(--ink);
      font-size: 18pt;
      font-weight: 470;
      line-height: 1;
      letter-spacing: -0.025em;
      font-optical-sizing: auto;
    }
    .tagline {
      margin-top: 5px;
      font-size: 7.2pt;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.11em;
      font-weight: 680;
    }
    .date {
      font-size: 8pt;
      color: var(--muted);
      text-align: right;
    }
    .hero {
      background: var(--sky);
      border-top: 4px solid var(--iris);
      padding: 22px 24px 21px;
      margin-bottom: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 112px;
      gap: 25px;
      align-items: stretch;
    }
    .section-kicker {
      color: var(--iris-strong);
      font-size: 7.2pt;
      font-weight: 720;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    h1,
    h2 {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-optical-sizing: auto;
      color: var(--ink);
    }
    h1 {
      font-size: 24pt;
      font-weight: 470;
      line-height: 1.08;
      letter-spacing: -0.025em;
      max-width: 470px;
    }
    .hero-summary {
      color: var(--muted);
      font-size: 9.3pt;
      line-height: 1.58;
      margin-top: 13px;
      max-width: 500px;
    }
    .score-card {
      border-left: 1px solid var(--sky-strong);
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .score-value {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 45pt;
      font-weight: 520;
      line-height: 0.88;
      color: var(--ink);
      letter-spacing: -0.045em;
      font-optical-sizing: auto;
    }
    .score-value span {
      color: var(--muted);
      font-size: 14pt;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .score-name {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.11em;
      color: var(--muted);
      margin-bottom: 10px;
      font-weight: 700;
    }
    .score-band {
      color: var(--iris-strong);
      font-size: 8.2pt;
      line-height: 1.3;
      font-weight: 680;
      margin-top: 9px;
    }
    .score-scale {
      color: var(--soft);
      font-size: 7pt;
      margin-top: 4px;
    }
    .score-note {
      border-top: 1px solid var(--sky-strong);
      color: var(--muted);
      font-size: 7.6pt;
      line-height: 1.45;
      margin-top: 17px;
      padding-top: 10px;
    }
    .score-note strong {
      color: var(--ink);
      font-weight: 680;
    }
    .subscores-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      margin-bottom: 22px;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .subscore {
      padding: 11px 13px 12px;
      border-right: 1px solid var(--line);
    }
    .subscore:last-child { border-right: 0; }
    .subscore-label {
      font-size: 7pt;
      letter-spacing: 0.08em;
      color: var(--muted);
      font-weight: 680;
      margin-bottom: 3px;
    }
    .subscore-value {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 18pt;
      font-weight: 520;
      line-height: 1.1;
      letter-spacing: -0.02em;
      font-optical-sizing: auto;
    }
    .metric-track {
      height: 3px;
      background: var(--iris-tint);
      margin-top: 7px;
      overflow: hidden;
    }
    .metric-fill {
      height: 100%;
      background: var(--iris);
    }
    .section {
      margin-bottom: 22px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 11px;
      padding-bottom: 7px;
      border-bottom: 1px solid var(--line);
    }
    h2 {
      font-size: 16pt;
      font-weight: 500;
      line-height: 1.08;
      letter-spacing: -0.018em;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      font-size: 8.8pt;
      line-height: 1.48;
      margin-bottom: 8px;
    }
    .checkbox {
      width: 10px;
      height: 10px;
      border: 1.25px solid var(--iris);
      flex: 0 0 10px;
      margin-top: 2px;
    }
    .signal-marker {
      width: 8px;
      height: 8px;
      flex: 0 0 8px;
      margin-top: 3px;
      border-radius: 50%;
    }
    .signal-marker.lands { background: var(--iris); }
    .signal-marker.context { background: var(--apricot); }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 13px;
      margin-bottom: 22px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .signal-panel {
      padding: 16px 17px 13px;
      border-top: 3px solid;
    }
    .signal-panel.lands {
      background: var(--sky);
      border-color: var(--iris);
    }
    .signal-panel.context {
      background: var(--proof);
      border-color: var(--apricot);
    }
    .signal-panel h2 {
      font-size: 14pt;
      margin-bottom: 11px;
    }
    .priority-section {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: baseline;
      column-gap: 13px;
      background: var(--butter-soft);
      border-top: 3px solid var(--butter);
      padding: 12px 17px 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .priority-section > .section-kicker {
      margin-bottom: 7px;
    }
    .priority-section > .section-header {
      margin-bottom: 7px;
      padding: 0;
      border: 0;
    }
    .priority-section > .priority-list {
      grid-column: 1 / -1;
    }
    .priority-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 22px;
    }
    .priority-item {
      border-top: 1px solid rgba(164, 117, 0, 0.22);
      padding: 5px 0;
      margin: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .priority-number {
      color: var(--iris-strong);
      font-size: 7pt;
      font-weight: 720;
      letter-spacing: 0.08em;
      flex: 0 0 20px;
      padding-top: 2px;
    }
    .priority-copy {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .priority-copy strong {
      color: var(--ink);
      font-size: 8.8pt;
      line-height: 1.35;
    }
    .priority-copy span {
      color: var(--muted);
      font-size: 7.8pt;
      line-height: 1.4;
    }
    .rewrite-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-top: 3px solid var(--iris);
      margin-bottom: 9px;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .rewrite-heading {
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      padding: 6px 11px;
      border-bottom: 1px solid var(--line);
    }
    .rewrite-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .col {
      padding: 10px 12px 11px;
    }
    .col.original {
      background: var(--proof);
      border-right: 1px solid var(--line);
    }
    .col.better {
      background: var(--sky);
    }
    .col-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      margin-bottom: 7px;
      color: var(--muted);
      font-weight: 700;
    }
    .content {
      font-size: 9pt;
      color: var(--ink);
      line-height: 1.48;
    }
    .better .content {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.38;
      font-weight: 480;
      font-optical-sizing: auto;
    }
    .note {
      display: grid;
      grid-template-columns: 112px 1fr;
      gap: 12px;
      padding: 7px 11px 8px;
      background: var(--butter-soft);
      border-top: 1px solid var(--line);
      font-size: 7.8pt;
      color: var(--muted);
    }
    .note strong {
      color: var(--ink);
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .tag-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .tag-label {
      font-size: 7.5pt;
      color: var(--muted);
      font-weight: 680;
      margin-right: 4px;
    }
    .tag {
      display: inline-block;
      padding: 3px 7px;
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid var(--sky-strong);
      border-radius: 2px;
      font-size: 7.5pt;
      font-weight: 600;
    }
    .tag-stretch {
      background: transparent;
      border-color: var(--control-line);
    }
    .positioning-suggestion {
      margin: 13px 0;
      padding: 13px 15px;
      background: rgba(255, 255, 255, 0.62);
      border-left: 3px solid var(--iris);
    }
    .positioning-suggestion p {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.45;
      color: var(--ink);
      font-weight: 470;
      font-optical-sizing: auto;
      margin: 0;
    }
    .alignment-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 13px;
      margin-top: 11px;
      padding-top: 10px;
      border-top: 1px solid var(--sky-strong);
      font-size: 7.6pt;
      color: var(--muted);
    }
    .meta-item {
      display: inline;
    }
    .meta-item strong {
      color: var(--ink);
      margin-right: 4px;
    }
    .alignment-section {
      background: var(--sky);
      border-top: 3px solid var(--iris);
      padding: 17px 19px 15px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    footer {
      margin-top: 28px;
      padding-top: 11px;
      border-top: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      color: var(--muted);
    }
  `;
}

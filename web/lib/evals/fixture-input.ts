// Some stored fixtures have an operator label before the actual resume. Never
// send the calibration band or expected score to the model as candidate data.
export function resumeTextFromFixture(value: string) {
  const lines = value.split(/\r?\n/);
  const first = lines[0] || "";
  const calibrationLabel = /\banchor\b/i.test(first)
    && /\((?:high_bar|strong_foundation|rare_air|thin signal|\d{2}[–-]\d{2})[^)]*\)/i.test(first);
  return calibrationLabel ? lines.slice(1).join("\n").trimStart() : value;
}

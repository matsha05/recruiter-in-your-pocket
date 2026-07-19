type ScoreableReport = {
  score?: unknown;
  subscores?: Record<string, unknown>;
  score_comment_short?: unknown;
  score_comment_long?: unknown;
  score_plain?: unknown;
};

export type ScoreCalibration = {
  originalScore: number;
  calibratedScore: number;
  bulletCount: number;
  outcomeBulletCount: number;
  ownershipBulletCount: number;
  genericDutyDensity: number;
};

function resumeBullets(resumeText: string) {
  return resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-•*]\s+\S/.test(line));
}

function hasOutcomeEvidence(line: string) {
  return /\d+(?:\.\d+)?\s*%|\$\s*\d|\b\d+(?:\.\d+)?\s*[kmb]\+?\b|\bfrom\s+(?:hours?|days?|weeks?|months?)\s+to\s+(?:minutes?|hours?|days?|weeks?)\b/i.test(line);
}

function beginsAsGenericDuty(line: string) {
  return /^[-•*]\s+(?:was responsible for|duties included|supported|assisted|helped|contributed|participated|worked on|played a role|engaged in)\b/i.test(line);
}

function hasOwnershipEvidence(line: string) {
  return /^[-•*]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|architected|owned|directed|headed|mentored|decided|partnered|collaborated)\b/i.test(line);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(99, Math.round(value)));
}

export function calibrateResumeScore<T extends ScoreableReport>(
  report: T,
  resumeText: string,
): { report: T; calibration: ScoreCalibration } {
  const originalScore = typeof report.score === "number" && Number.isFinite(report.score)
    ? clampScore(report.score)
    : 0;
  const bullets = resumeBullets(resumeText);
  const outcomeBulletCount = bullets.filter(hasOutcomeEvidence).length;
  const ownershipBulletCount = bullets.filter(hasOwnershipEvidence).length;
  const genericDutyCount = bullets.filter(beginsAsGenericDuty).length;
  const bulletCount = bullets.length;
  const outcomeDensity = bulletCount > 0 ? outcomeBulletCount / bulletCount : 0;
  const ownershipDensity = bulletCount > 0 ? ownershipBulletCount / bulletCount : 0;
  const genericDutyDensity = bulletCount > 0 ? genericDutyCount / bulletCount : 0;
  let calibratedScore = originalScore;

  if (bulletCount >= 8 && outcomeDensity >= 0.8 && ownershipDensity >= 0.65) {
    calibratedScore = Math.max(calibratedScore, 92);
    calibratedScore = Math.min(calibratedScore, 97);
  } else if (bulletCount >= 5 && outcomeBulletCount >= 8 && outcomeDensity >= 0.6) {
    calibratedScore = Math.max(calibratedScore, 88);
    calibratedScore = Math.min(calibratedScore, 95);
  } else if (outcomeBulletCount >= 3) {
    calibratedScore = Math.max(calibratedScore, 78);
    calibratedScore = Math.min(calibratedScore, 88);
  }

  if (bulletCount >= 8 && outcomeBulletCount === 0 && genericDutyDensity >= 0.45) {
    calibratedScore = Math.min(calibratedScore, 68);
  }

  calibratedScore = clampScore(calibratedScore);
  const calibratedReport = { ...report, score: calibratedScore } as T;

  if (calibratedScore !== originalScore) {
    if (calibratedScore >= 88) {
      calibratedReport.score_comment_short = "Dense outcome evidence makes the impact easy to verify; remaining work is mostly positioning.";
      calibratedReport.score_comment_long = "The resume repeatedly shows scope, ownership, and measurable outcomes across roles. Leadership and business impact are easy to verify. Remaining opportunities are about scan order and optional context, not missing evidence.";
      calibratedReport.score_plain = "This is a strong, evidence-rich resume. Focus the next pass on positioning and scan speed.";
    } else if (calibratedScore >= 78) {
      calibratedReport.score_comment_short = "Several concrete outcomes are visible, with a few uneven areas still limiting the first read.";
      calibratedReport.score_comment_long = "The resume contains multiple specific outcomes and credible ownership signals. Evidence is not equally strong in every role. Tightening the weakest bullets will make the story easier to place.";
      calibratedReport.score_plain = "This has a credible evidence base. Strengthen the few thin bullets instead of rewriting what already works.";
    } else if (calibratedScore <= 68) {
      calibratedReport.score_comment_short = "Most bullets describe responsibilities; measurable outcomes and scope are still too sparse.";
      calibratedReport.score_comment_long = "The resume shows relevant responsibilities but limited evidence of scale or results. Titles and tenure cannot substitute for outcomes on the page. Add grounded scope and before-and-after evidence to the highest-value bullets first.";
      calibratedReport.score_plain = "The experience may be relevant, but the proof is too thin. Add real scope and outcomes before polishing the wording.";
    }
  }

  if (report.subscores && typeof report.subscores === "object" && calibratedScore !== originalScore) {
    calibratedReport.subscores = Object.fromEntries(
      Object.entries(report.subscores).map(([key, value]) => {
        if (typeof value !== "number" || !Number.isFinite(value)) return [key, value];
        const coherent = calibratedScore > originalScore
          ? Math.max(value, calibratedScore - 6)
          : Math.min(value, calibratedScore + 6);
        return [key, clampScore(coherent)];
      }),
    );
  }

  return {
    report: calibratedReport,
    calibration: {
      originalScore,
      calibratedScore,
      bulletCount,
      outcomeBulletCount,
      ownershipBulletCount,
      genericDutyDensity,
    },
  };
}

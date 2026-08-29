type ScoreableReport = {
  score?: unknown;
  subscores?: Record<string, unknown>;
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
    .split(/(?=[•●]\s)|(?=^[-*]\s)/m)
    .map((line) => line.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter((line) => /^[-•●*]\s+\S/.test(line));
}

function hasOutcomeEvidence(line: string) {
  return /\d+(?:\.\d+)?\s*%|\$\s*\d|\b\d+(?:\.\d+)?\s*[kmb]\+?\b|\bfrom\s+(?:hours?|days?|weeks?|months?)\s+to\s+(?:minutes?|hours?|days?|weeks?)\b/i.test(line);
}

function hasQualitativeOutcomeEvidence(line: string) {
  return /\b(?:achieved|closed|doubled|generated|grew|improved|increased|promoted|ranked|reduced|saved|scaled|streamlin(?:e|ed|ing))\b/i.test(line);
}

function beginsAsGenericDuty(line: string) {
  return /^[-•●*]\s+(?:was responsible for|duties included|supported|assisted|helped|contributed|participated|worked on|played a role|engaged in)\b/i.test(line);
}

function hasOwnershipEvidence(line: string) {
  return /^[-•●*]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|architected|owned|directed|headed|mentored|decided|partnered|collaborated)\b/i.test(line);
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
  const qualitativeOutcomeBulletCount = bullets.filter(hasQualitativeOutcomeEvidence).length;
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
  } else if (outcomeBulletCount >= 5 && outcomeDensity >= 0.2) {
    calibratedScore = Math.max(calibratedScore, 84);
    calibratedScore = Math.min(calibratedScore, 89);
  } else if (outcomeBulletCount >= 5) {
    calibratedScore = Math.max(calibratedScore, 80);
    calibratedScore = Math.min(calibratedScore, 88);
  } else if (outcomeBulletCount >= 3) {
    calibratedScore = Math.max(calibratedScore, 78);
    calibratedScore = Math.min(calibratedScore, 88);
  } else if (bulletCount >= 8 && qualitativeOutcomeBulletCount >= 2) {
    calibratedScore = Math.max(calibratedScore, 68);
    calibratedScore = Math.min(calibratedScore, 78);
  }

  if (bulletCount >= 8 && outcomeBulletCount === 0 && genericDutyDensity >= 0.45) {
    calibratedScore = Math.min(calibratedScore, 68);
  }

  calibratedScore = clampScore(calibratedScore);
  const calibratedReport = { ...report, score: calibratedScore } as T;

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

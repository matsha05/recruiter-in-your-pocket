import { canonicalizeUserSourceText } from "../security/inputSanitization";

type ActionRelation = {
  action: string;
  object: string;
  metrics: string[];
};

type DirectionRelation = { from: string; to: string };

const actionPattern = /\b(?:lead|leads|leading|led|support|supports|supported|supporting|grow|grows|growing|grew|grown|reduce|reduces|reduced|reducing|increase|increases|increased|increasing|improve|improves|improved|improving|build|builds|building|built|design|designs|designed|designing|implement|implements|implemented|implementing|create|creates|created|creating|manage|manages|managed|managing|own|owns|owned|owning|drive|drives|driving|drove|driven|deliver|delivers|delivered|delivering|launch|launches|launched|launching|coordinate|coordinates|coordinated|coordinating|migrate|migrates|migrated|migrating|develop|develops|developed|developing|generate|generates|generated|generating|save|saves|saved|saving|scale|scales|scaled|scaling)\b/giu;
const metricPattern = /[<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,]*(?:\.\d+)?(?:\s*(?:%|[kmb]|x|×))?\+?(?:\s+(?:people|persons?|members?|hires?|employees?|engineers?|scientists?|designers?|researchers?|teams?|groups?|users?|customers?|clients?|countries?|regions?|projects?|releases?|records?|reports?|meetings?|schedules?|days?|weeks?|months?|years?))?/giu;
const directionPattern = /\bfrom\s+([<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,]*(?:\.\d+)?(?:\s*(?:%|[kmb]|x|×))?\+?(?:\s+(?:people|persons?|members?|hires?|employees?|engineers?|scientists?|designers?|researchers?|teams?|groups?|users?|customers?|clients?|countries?|regions?|projects?|releases?|records?|reports?|meetings?|schedules?|days?|weeks?|months?|years?))?)\s+to\s+([<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,]*(?:\.\d+)?(?:\s*(?:%|[kmb]|x|×))?\+?(?:\s+(?:people|persons?|members?|hires?|employees?|engineers?|scientists?|designers?|researchers?|teams?|groups?|users?|customers?|clients?|countries?|regions?|projects?|releases?|records?|reports?|meetings?|schedules?|days?|weeks?|months?|years?))?)/giu;

const actionAliases: Record<string, string> = {
  led: "lead", leads: "lead", leading: "lead",
  supports: "support", supported: "support", supporting: "support",
  grew: "grow", grown: "grow", grows: "grow", growing: "grow",
  reduces: "reduce", reduced: "reduce", reducing: "reduce",
  increases: "increase", increased: "increase", increasing: "increase",
  improves: "improve", improved: "improve", improving: "improve",
  builds: "build", built: "build", building: "build",
  designs: "design", designed: "design", designing: "design",
  implements: "implement", implemented: "implement", implementing: "implement",
  creates: "create", created: "create", creating: "create",
  manages: "manage", managed: "manage", managing: "manage",
  owns: "own", owned: "own", owning: "own",
  drives: "drive", drove: "drive", driven: "drive", driving: "drive",
  delivers: "deliver", delivered: "deliver", delivering: "deliver",
  launches: "launch", launched: "launch", launching: "launch",
  coordinates: "coordinate", coordinated: "coordinate", coordinating: "coordinate",
  migrates: "migrate", migrated: "migrate", migrating: "migrate",
  develops: "develop", developed: "develop", developing: "develop",
  generates: "generate", generated: "generate", generating: "generate",
  saves: "save", saved: "save", saving: "save",
  scales: "scale", scaled: "scale", scaling: "scale",
};

function normalizedText(value: string) {
  return canonicalizeUserSourceText(value).replace(/\s+/gu, " ").trim();
}

function normalizedMetric(value: string) {
  return normalizedText(value).toLowerCase().replace(/,/gu, "").replace(/−/gu, "-");
}

function normalizedObject(value: string) {
  return normalizedText(value)
    .toLowerCase()
    .replace(/^(?:a|an|the)\s+/u, "")
    .replace(/\b(?:by|from|to)\b[\s\S]*$/u, "")
    .replace(/(?:\band\b|[,;:.])[\s\S]*$/u, "")
    .replace(/[^\p{L}\p{M}\p{N}+#./-]+/gu, " ")
    .trim();
}

function actionRelations(value: string) {
  const text = normalizedText(value);
  const matches = Array.from(text.matchAll(actionPattern));
  return matches.flatMap((match, index): ActionRelation[] => {
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const segment = text.slice(start, end);
    const object = normalizedObject(segment);
    if (!object) return [];
    return [{
      action: actionAliases[match[0].toLowerCase()] || match[0].toLowerCase(),
      object,
      metrics: Array.from(segment.matchAll(metricPattern), (metric) => normalizedMetric(metric[0])),
    }];
  });
}

function directionRelations(value: string) {
  return Array.from(normalizedText(value).matchAll(directionPattern), (match): DirectionRelation => ({
    from: normalizedMetric(match[1]),
    to: normalizedMetric(match[2]),
  }));
}

function sameActionObject(left: ActionRelation, right: ActionRelation) {
  return left.action === right.action && left.object === right.object;
}

export function relationshipBindingIssues(candidate: string, sourceText: string) {
  const sourceDirections = directionRelations(sourceText);
  const issues = directionRelations(candidate).flatMap((relation) => {
    if (sourceDirections.some((source) => source.from === relation.from && source.to === relation.to)) return [];
    return sourceDirections.some((source) => source.from === relation.to && source.to === relation.from)
      ? [`unsupported direction: from ${relation.from} to ${relation.to}`]
      : [];
  });

  const candidateRelations = actionRelations(candidate);
  const sourceRelations = actionRelations(sourceText);
  for (const relation of candidateRelations) {
    const exactPair = sourceRelations.filter((source) => sameActionObject(source, relation));
    for (const metric of relation.metrics) {
      const exactMetric = exactPair.some((source) => source.metrics.includes(metric));
      const metricExistsElsewhere = sourceRelations.some((source) => source.metrics.includes(metric));
      if (!exactMetric && exactPair.length > 0 && metricExistsElsewhere) {
        issues.push(`unsupported metric binding: ${relation.action} ${relation.object} ${metric}`);
      }
    }
    if (
      candidateRelations.length > 1
      && sourceRelations.length > 1
      && exactPair.length === 0
      && sourceRelations.some((source) => source.action === relation.action)
      && sourceRelations.some((source) => source.object === relation.object)
    ) issues.push(`unsupported responsibility binding: ${relation.action} ${relation.object}`);
  }
  return Array.from(new Set(issues));
}

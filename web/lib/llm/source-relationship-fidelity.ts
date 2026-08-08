import { canonicalizeUserSourceText } from "../security/inputSanitization";

type DirectionRelation = { from: string; to: string };

type RelationshipTuple = {
  actor: string;
  action: string;
  object: string;
  metrics: string[];
  directions: DirectionRelation[];
};

type ClauseContext = Pick<RelationshipTuple, "actor" | "action" | "object">;

const actionPattern = /\b(?:lead|leads|leading|led|support|supports|supported|supporting|boost|boosts|boosted|boosting|grow|grows|growing|grew|grown|reduce|reduces|reduced|reducing|increase|increases|increased|increasing|improve|improves|improved|improving|raise|raises|raised|raising|enhance|enhances|enhanced|enhancing|lower|lowers|lowered|lowering|cut|cuts|cutting|decrease|decreases|decreased|decreasing|double|doubles|doubled|doubling|triple|triples|tripled|tripling|achieve|achieves|achieved|achieving|ship|ships|shipped|shipping|accelerate|accelerates|accelerated|accelerating|earn|earns|earned|earning|build|builds|building|built|design|designs|designed|designing|implement|implements|implemented|implementing|create|creates|created|creating|manage|manages|managed|managing|own|owns|owned|owning|drive|drives|driving|drove|driven|deliver|delivers|delivered|delivering|launch|launches|launched|launching|coordinate|coordinates|coordinated|coordinating|migrate|migrates|migrated|migrating|develop|develops|developed|developing|generate|generates|generated|generating|save|saves|saved|saving|scale|scales|scaled|scaling|move|moves|moved|moving|transition|transitions|transitioned|transitioning|promote|promotes|promoted|promoting)\b/giu;
const metricPattern = /[<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,]*(?:\.\d+)?(?:\s*(?:%|[kmb]|x|×))?\+?(?:\s+(?:people|persons?|members?|hires?|employees?|engineers?|scientists?|designers?|researchers?|teams?|groups?|users?|customers?|clients?|countries?|regions?|projects?|releases?|records?|reports?|meetings?|schedules?|days?|weeks?|months?|years?))?/giu;
const directionPattern = /\bfrom\s+(.+?)\s+to\s+(.+?)(?=\s+(?:and|but|while|whereas|by|within|over|during)\b|[;!?](?:\s|$)|\.(?:\s|$)|$)/giu;
const arrowMarkerPattern = /(?:-{1,2}>|={1,2}>|[→⟶⟹➜➝➞⟾])/u;
const passiveAuxiliaryPattern = /\b(?:(?:has|have|had)\s+been|am|are|is|was|were|be|been|being)\s*$/iu;

const actionAliases: Record<string, string> = {
  led: "lead", leads: "lead", leading: "lead",
  supports: "support", supported: "support", supporting: "support",
  boosts: "boost", boosted: "boost", boosting: "boost",
  grew: "grow", grown: "grow", grows: "grow", growing: "grow",
  reduces: "reduce", reduced: "reduce", reducing: "reduce",
  increases: "increase", increased: "increase", increasing: "increase",
  improves: "improve", improved: "improve", improving: "improve",
  raises: "raise", raised: "raise", raising: "raise",
  enhances: "enhance", enhanced: "enhance", enhancing: "enhance",
  lowers: "lower", lowered: "lower", lowering: "lower",
  cuts: "cut", cutting: "cut",
  decreases: "decrease", decreased: "decrease", decreasing: "decrease",
  doubles: "double", doubled: "double", doubling: "double",
  triples: "triple", tripled: "triple", tripling: "triple",
  achieves: "achieve", achieved: "achieve", achieving: "achieve",
  ships: "ship", shipped: "ship", shipping: "ship",
  accelerates: "accelerate", accelerated: "accelerate", accelerating: "accelerate",
  earns: "earn", earned: "earn", earning: "earn",
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
  moves: "move", moved: "move", moving: "move",
  transitions: "transition", transitioned: "transition", transitioning: "transition",
  promotes: "promote", promoted: "promote", promoting: "promote",
};

function normalizedText(value: string) {
  return canonicalizeUserSourceText(value).replace(/\s+/gu, " ").trim();
}

function normalizedMetric(value: string) {
  return normalizedText(value)
    .toLowerCase()
    .replace(/,/gu, "")
    .replace(/−/gu, "-")
    .replace(/([$€£¥₹])\s+/gu, "$1")
    .replace(/\s+(?=[%kmbx×+](?:\s|$))/gu, "");
}

function normalizedPhrase(value: string) {
  return normalizedText(value)
    .toLowerCase()
    .replace(/^[•●◦▪▫‣⁃*\-–—]+\s*/u, "")
    .replace(/^(?:and|but|while|whereas)\s+/u, "")
    .replace(/^(?:a|an|the)\s+/u, "")
    .replace(/[^\p{L}\p{M}\p{N}+#./'’\-]+/gu, " ")
    .replace(/^[.,:;\s]+|[.,:;\s]+$/gu, "")
    .trim();
}

function normalizedActor(value: string) {
  const lastIntroductorySegment = normalizedText(value).split(/[,;:]\s*/u).at(-1) || "";
  return normalizedPhrase(lastIntroductorySegment.replace(passiveAuxiliaryPattern, ""));
}

function normalizedObject(value: string) {
  return normalizedPhrase(value.replace(passiveAuxiliaryPattern, ""));
}

function actionMatches(value: string) {
  return Array.from(value.matchAll(actionPattern));
}

function clausalActionMatches(value: string) {
  const arrow = arrowMarkerPattern.exec(value);
  return actionMatches(value).filter((match) => (
    arrow?.index === undefined || (match.index || 0) < arrow.index
  ));
}

function metricRelations(value: string) {
  return Array.from(value.matchAll(metricPattern), (match) => normalizedMetric(match[0]));
}

function normalizedEndpoint(value: string) {
  const text = normalizedText(value);
  const matches = Array.from(text.matchAll(metricPattern));
  return matches.length === 1 && normalizedText(matches[0][0]) === text
    ? normalizedMetric(text)
    : normalizedPhrase(text);
}

function arrowDirection(value: string) {
  const marker = arrowMarkerPattern.exec(value);
  if (!marker || marker.index === undefined) return null;
  const rawLeft = normalizedText(value.slice(0, marker.index)).replace(/[,:;\s]+$/u, "");
  const rawRight = normalizedText(value.slice(marker.index + marker[0].length)).replace(/^[,:;\s]+|[.!?;\s]+$/gu, "");
  if (!rawLeft || !rawRight) return null;
  const titleTail = rawLeft.match(/((?:[\p{Lu}\p{Lt}\d][\p{L}\p{M}\p{N}.+#/'’\-]*)(?:\s+(?:[\p{Lu}\p{Lt}\d][\p{L}\p{M}\p{N}.+#/'’\-]*))*)$/u)?.[1];
  const metricTail = rawLeft.match(/([<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,.]*(?:\s*(?:%|[kmb]|x|×))?\+?)$/iu)?.[1];
  const fromRaw = titleTail || metricTail || rawLeft;
  const objectRaw = rawLeft.slice(0, rawLeft.length - fromRaw.length).trim();
  return {
    relation: { from: normalizedEndpoint(fromRaw), to: normalizedEndpoint(rawRight) },
    object: normalizedObject(objectRaw),
  };
}

function directionRelations(value: string) {
  const wordDirections = Array.from(value.matchAll(directionPattern), (match): DirectionRelation => ({
    from: normalizedEndpoint(match[1]),
    to: normalizedEndpoint(match[2]),
  }));
  const parsedArrow = arrowDirection(value);
  const arrowDirections = parsedArrow ? [parsedArrow.relation] : [];
  return [...wordDirections, ...arrowDirections].filter((relation) => relation.from && relation.to);
}

function relationalCoordinationPart(value: string) {
  if (actionMatches(value).length > 0 || directionRelations(value).length > 0) return true;
  return /\b(?:by|at|of)\s+[<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d/iu.test(value);
}

function coordinatedParts(value: string) {
  const rawParts = value.split(/\s*(?:;|\b(?:and|but|while|whereas)\b)\s*/iu);
  const conjunctionParts = rawParts.reduce<string[]>((parts, part) => {
    if (parts.length === 0 || relationalCoordinationPart(part)) parts.push(part);
    else parts[parts.length - 1] = `${parts[parts.length - 1]} and ${part}`;
    return parts;
  }, []);
  return conjunctionParts.flatMap((part) => {
    const commaParts = part.split(/,\s*/u).filter(Boolean);
    if (commaParts.length < 2) return [part];
    const split: string[] = [];
    for (const commaPart of commaParts) {
      const prior = split.at(-1);
      if (!prior) split.push(commaPart);
      else if (
        (actionMatches(prior).length > 0 && actionMatches(commaPart).length === 0 && metricRelations(commaPart).length > 0)
        || (actionMatches(prior).length > 0 && actionMatches(commaPart).length > 0
          && passiveAuxiliaryPattern.test(commaPart.slice(0, actionMatches(commaPart)[0].index || 0)))
      ) split.push(commaPart);
      else split[split.length - 1] = `${prior}, ${commaPart}`;
    }
    return split;
  });
}

function predicateObject(value: string) {
  const arrow = arrowDirection(value);
  const withoutDirection = arrow
    ? arrow.object
    : value.split(/\b(?:by|from|to)\b/iu, 1)[0];
  return normalizedObject(withoutDirection);
}

function passiveAgent(value: string) {
  const match = value.match(/^\s*by\s+(.+?)(?=\s+(?:from|to|with|using|via|for|at|in|on)\b|[,.;!?]|$)/iu);
  if (!match || metricRelations(match[1]).length > 0) return "";
  return normalizedActor(match[1]);
}

function parseRelationalSentence(value: string) {
  const context: ClauseContext = { actor: "", action: "", object: "" };
  const relations: RelationshipTuple[] = [];

  for (const part of coordinatedParts(value)) {
    const actionMatch = clausalActionMatches(part)[0];
    if (!actionMatch) {
      const metrics = metricRelations(part);
      const directions = directionRelations(part);
      if (metrics.length === 0 && directions.length === 0) continue;
      const action = context.action || (directions.length > 0 ? "transition" : "measure");
      const object = predicateObject(part) || context.object || "direction";
      relations.push({ ...context, action, object, metrics, directions });
      context.action = action;
      context.object = object;
      continue;
    }

    const before = part.slice(0, actionMatch.index || 0);
    const after = part.slice((actionMatch.index || 0) + actionMatch[0].length);
    const agent = passiveAgent(after);
    const passive = Boolean(agent) || passiveAuxiliaryPattern.test(before);
    const actor = passive
      ? agent || context.actor
      : normalizedActor(before) || context.actor;
    const object = passive
      ? normalizedObject(before) || context.object
      : predicateObject(after);
    const relation: RelationshipTuple = {
      actor,
      action: actionAliases[actionMatch[0].toLowerCase()] || actionMatch[0].toLowerCase(),
      object,
      metrics: metricRelations(after),
      directions: directionRelations(after),
    };
    relations.push(relation);
    context.actor = actor;
    context.action = relation.action;
    if (object) context.object = object;
  }

  for (const [index, relation] of relations.entries()) {
    if (relation.object) continue;
    const next = relations.slice(index + 1).find((candidate) => (
      candidate.object && (!relation.actor || !candidate.actor || candidate.actor === relation.actor)
    ));
    if (next) relation.object = next.object;
  }
  return relations.filter((relation) => relation.object || relation.directions.length > 0);
}

function relationshipTuples(value: string) {
  return canonicalizeUserSourceText(value)
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/u)
    .map((sentence) => normalizedText(sentence))
    .filter(Boolean)
    .flatMap(parseRelationalSentence);
}

function unsafeRelationalClauses(value: string) {
  return canonicalizeUserSourceText(value)
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/u)
    .map((sentence) => normalizedText(sentence))
    .filter((sentence) => {
      const actions = clausalActionMatches(sentence);
      const directionMarker = arrowMarkerPattern.test(sentence) || /\bfrom\b.*\bto\b/iu.test(sentence);
      const unparsedDirection = directionMarker && directionRelations(sentence).length === 0;
      const unsplitActions = actions.length > 1
        && coordinatedParts(sentence).some((part) => clausalActionMatches(part).length > 1);
      const parsed = parseRelationalSentence(sentence);
      const unboundMetric = metricRelations(sentence).length
        > parsed.reduce((count, relation) => count + relation.metrics.length, 0);
      const unboundDirection = directionRelations(sentence).length
        > parsed.reduce((count, relation) => count + relation.directions.length, 0);
      return unparsedDirection || unsplitActions || unboundMetric || unboundDirection;
    });
}

function actorMatches(source: RelationshipTuple, candidate: RelationshipTuple) {
  return !candidate.actor || source.actor === candidate.actor;
}

function sameBaseTuple(source: RelationshipTuple, candidate: RelationshipTuple) {
  return actorMatches(source, candidate)
    && source.action === candidate.action
    && source.object === candidate.object;
}

function sameDirection(left: DirectionRelation, right: DirectionRelation) {
  return left.from === right.from && left.to === right.to;
}

function directionDisplay(direction: DirectionRelation) {
  return `from ${direction.from} to ${direction.to}`;
}

export function hasExactRelationshipBindings(candidate: string, sourceText: string) {
  if (unsafeRelationalClauses(candidate).length > 0) return false;
  const candidateRelations = relationshipTuples(candidate);
  const sourceRelations = relationshipTuples(sourceText);
  return candidateRelations.length > 0 && candidateRelations.every((relation) => {
    const exactBase = sourceRelations.filter((source) => sameBaseTuple(source, relation));
    return exactBase.length > 0
      && relation.metrics.every((metric) => exactBase.some((source) => source.metrics.includes(metric)))
      && relation.directions.every((direction) => exactBase.some((source) => (
        source.directions.some((item) => sameDirection(item, direction))
      )));
  });
}

export function relationshipBindingIssues(candidate: string, sourceText: string) {
  const candidateRelations = relationshipTuples(candidate);
  const sourceRelations = relationshipTuples(sourceText);
  const issues = unsafeRelationalClauses(candidate)
    .map((clause) => `unresolved relationship binding: ${clause}`);

  for (const relation of candidateRelations) {
    const exactBase = sourceRelations.filter((source) => sameBaseTuple(source, relation));
    for (const metric of relation.metrics) {
      const exactMetric = exactBase.some((source) => source.metrics.includes(metric));
      const metricExistsElsewhere = sourceRelations.some((source) => source.metrics.includes(metric));
      if (!exactMetric && exactBase.length > 0 && metricExistsElsewhere) {
        issues.push(`unsupported metric binding: ${relation.action} ${relation.object} ${metric}`);
      }
    }
    for (const direction of relation.directions) {
      const exactDirection = exactBase.some((source) => source.directions.some((item) => sameDirection(item, direction)));
      if (!exactDirection && exactBase.length > 0) {
        issues.push(`unsupported direction binding: ${relation.action} ${relation.object} ${directionDisplay(direction)}`);
      }
    }

    if (exactBase.length > 0) continue;
    const actorExists = !relation.actor || sourceRelations.some((source) => source.actor === relation.actor);
    const actionExists = sourceRelations.some((source) => source.action === relation.action);
    const objectExists = sourceRelations.some((source) => source.object === relation.object);
    if (actorExists && actionExists && objectExists && sourceRelations.length > 1) {
      const actor = relation.actor ? `${relation.actor} ` : "";
      issues.push(`unsupported responsibility binding: ${actor}${relation.action} ${relation.object}`);
    }
  }
  return Array.from(new Set(issues));
}

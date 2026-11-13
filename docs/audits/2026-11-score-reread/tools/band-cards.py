"""The count the rule rests on: distinct saved reads at 85 to 92, by cards that need work.

Usage, from the repository root: python3 docs/audits/2026-11-score-reread/tools/band-cards.py docs/audits
Add tests/fixtures/results to count the eval run files too (they are not committed).
A read is counted once however many files hold a copy of it. No model call.
"""
import glob, hashlib, json, os, re, sys
from collections import Counter

WORK = {"line", "structure", "dates"}


def reports(node):
    stack = [node]
    while stack:
        cur = stack.pop(0)
        if isinstance(cur, dict):
            cards = cur.get("cards")
            if isinstance(cur.get("score"), int) and isinstance(cards, list) and cards and isinstance(cards[0], dict) and "kind" in cards[0]:
                yield cur
            else:
                stack.extend(cur.values())
        elif isinstance(cur, list):
            stack.extend(cur)


seen = {}
files = 0
for root in sys.argv[1:]:
    for path in sorted(glob.glob(os.path.join(root, "**", "*.json"), recursive=True)):
        try:
            data = json.load(open(path))
        except Exception:
            continue
        files += 1
        for report in reports(data):
            # A read saved before and after the validator widened its quotes is one read: key on what widening leaves alone.
            body = json.dumps([report["score"], re.sub(r"[^a-z0-9]", "", str(report.get("verdict")).lower()), [c.get("kind") for c in report["cards"]]])
            key = hashlib.sha256(body.encode()).hexdigest()
            if key in seen:
                continue
            kinds = [c.get("kind") for c in report["cards"]]
            seen[key] = (report["score"], sum(1 for k in kinds if k in WORK), os.path.relpath(path, root))

rows = list(seen.values())
print(f"{files} files, {len(rows)} distinct reads")
clear = [r for r in rows if 85 <= r[0] <= 92]
print(f"distinct reads at 85 to 92: {len(clear)}")
print("  by cards that need work:", dict(sorted(Counter(r[1] for r in clear).items())))
print("  with more than three:")
for r in clear:
    if r[1] > 3:
        print("   ", r)
below = [r for r in rows if 70 <= r[0] <= 84]
print(f"distinct reads at 70 to 84: {len(below)}; three or fewer cards that need work: {sum(1 for r in below if r[1] <= 3)}")

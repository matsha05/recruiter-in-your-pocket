import assert from "node:assert/strict";
import {
  REPORT_ACCESS_NOT_USED,
  REPORT_ACCESS_OUTCOME_UNKNOWN,
  REPORT_ACCESS_RESTORED,
  REPORT_ACCESS_USED_CHECK,
  forVisitor,
  hasAccessOutcome,
  withGenerationAccessOutcome,
} from "../lib/billing/generationFailureCopy";

const count = (text: string, phrase: string) => text.split(phrase).length - 1;

// The server already states the outcome; the client wraps the same message again.
// It must say it once, not twice.
const fromServer = withGenerationAccessOutcome("We can't check report access right now. The problem is on our side. Give it a minute and try again.", false);
const onClient = withGenerationAccessOutcome(fromServer, false);
assert.equal(count(onClient, REPORT_ACCESS_NOT_USED), 1, onClient);
assert.equal(onClient, fromServer);

// A message that already carries a different outcome keeps it rather than gaining a contradiction.
const unknown = withGenerationAccessOutcome("Release failed.", null);
assert.equal(withGenerationAccessOutcome(unknown, false), unknown);

// Someone who isn't signed in has only the free report and no My reports page.
for (const accountCopy of [REPORT_ACCESS_NOT_USED, REPORT_ACCESS_OUTCOME_UNKNOWN, REPORT_ACCESS_RESTORED, REPORT_ACCESS_USED_CHECK]) {
  const guest = forVisitor(`The connection dropped. ${accountCopy}`, false);
  assert.doesNotMatch(guest, /My reports|one of your reports/, guest);
  assert.match(guest, /your free report/, guest);
  assert.ok(hasAccessOutcome(guest), guest);
  assert.equal(forVisitor(`The connection dropped. ${accountCopy}`, true), `The connection dropped. ${accountCopy}`);
}

// A guest message that passes through the wrapper again is not stated twice either.
const guestUnknown = forVisitor(unknown, false);
assert.equal(withGenerationAccessOutcome(guestUnknown, null), guestUnknown);

console.log("generation failure copy tests passed");

import assert from "node:assert/strict";
import { riskDecision, parsePaymentNotice } from "../src/fintech_chat.ts";

assert.equal(riskDecision(12000, "USD"), "review");
assert.equal(riskDecision(42, "USD"), "post");
assert.throws(() => parsePaymentNotice({ room: "r", amount: -1 }));
console.log("risk decision and request validation pass");

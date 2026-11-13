import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DESIGN_PREFERENCES, clampGlass, normalizeDesignPreferences, glassStyleValues } from "./preferences.ts";

test("corrupted or unknown settings use safe defaults", () => {
  assert.deepEqual(normalizeDesignPreferences(null), DEFAULT_DESIGN_PREFERENCES);
  assert.deepEqual(normalizeDesignPreferences({theme:"malicious",glass:"100",density:"unknown"}), DEFAULT_DESIGN_PREFERENCES);
});
test("valid preferences normalize", () => {
  assert.deepEqual(normalizeDesignPreferences({theme:"light",glass:51.7,density:"comfortable"}),
    {theme:"light",glass:52,density:"comfortable"});
});
test("glass percentage is bounded and finite", () => {
  assert.equal(clampGlass(-3), 0);
  assert.equal(clampGlass(300), 100);
  assert.equal(clampGlass(Number.NaN), 35);
});
test("CSS glass values are safe at the extremes", () => {
  assert.deepEqual(glassStyleValues(0), {blur:"0px",opacity:"1.000"});
  assert.deepEqual(glassStyleValues(100), {blur:"18px",opacity:"0.780"});
});

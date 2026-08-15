import assert from "node:assert/strict";
import { test } from "node:test";
import { haversineMiles, optimizeRoute } from "./routing.ts";

const yard = { id: "shop", lat: 35.7017, lng: -96.8809 };
const agra = { id: "agra", lat: 35.8945, lng: -96.8695 };
const stroud = { id: "stroud", lat: 35.7487, lng: -96.6503 };
const okc = { id: "okc", lat: 35.4676, lng: -97.5164 };

test("haversine is in a sensible Oklahoma range", () => {
  const miles = haversineMiles(yard, stroud);
  assert.ok(miles > 10 && miles < 25);
});

test("optimizeRoute starts at the shop and visits every stop", () => {
  const result = optimizeRoute(yard, [okc, agra, stroud]);
  assert.equal(result.ordered[0].id, "shop");
  assert.equal(result.ordered.length, 4);
  assert.deepEqual(
    new Set(result.ordered.map((point) => point.id)),
    new Set(["shop", "okc", "agra", "stroud"])
  );
  assert.ok(result.totalMiles > 0);
  assert.equal(result.legs.length, 3);
});

test("optimizeRoute is shorter than a naive far-first order", () => {
  const optimized = optimizeRoute(yard, [okc, agra, stroud]).totalMiles;
  const naive = haversineMiles(yard, okc) + haversineMiles(okc, agra) + haversineMiles(agra, stroud);
  assert.ok(optimized <= naive + 0.01);
});

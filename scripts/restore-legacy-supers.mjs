#!/usr/bin/env node
/**
 * Copy hive super counts from a legacy Supabase project into production.
 *
 * Requires:
 *   LEGACY_SUPABASE_URL          e.g. https://jjgszmilzgsbftgpqskg.supabase.co
 *   LEGACY_SUPABASE_SERVICE_ROLE service_role key for the legacy project
 *   SUPABASE_ACCESS_TOKEN or SUPABASE_PAT (for production project management API)
 *
 * Optional:
 *   SUPABASE_PROJECT_REF (defaults to vbusjzjtiiflmspxasoi)
 */

import {
  HIVE_STACKS_END,
  HIVE_STACKS_START,
  parseHiveStacksFromDescription,
} from "../src/lib/hive-stack-store.ts";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function inventoryFromRow(row) {
  const medium = row.medium_count;
  const shallow = row.shallow_count;
  if (typeof medium === "number" && typeof shallow === "number") {
    return { medium, shallow };
  }
  if (typeof row.super_count === "number" && row.super_count > 0) {
    return { medium: row.super_count, shallow: 0 };
  }
  return null;
}

async function fetchLegacyStacks(url, serviceRole) {
  const headers = {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
  };

  let hivesRes = await fetch(
    `${url}/rest/v1/hives?select=id,name,apiary_id,super_count,medium_count,shallow_count`,
    { headers }
  );
  if (!hivesRes.ok) {
    const body = await hivesRes.text();
    if (/column .* does not exist/i.test(body)) {
      hivesRes = await fetch(
        `${url}/rest/v1/hives?select=id,name,apiary_id`,
        { headers }
      );
      if (!hivesRes.ok) {
        throw new Error(
          `Legacy hives: HTTP ${hivesRes.status} ${await hivesRes.text()}`
        );
      }
    } else {
      throw new Error(`Legacy hives: HTTP ${hivesRes.status} ${body}`);
    }
  }
  const hives = await hivesRes.json();

  const apiaryIds = [...new Set(hives.map((row) => row.apiary_id))];
  const apiariesRes = await fetch(
    `${url}/rest/v1/apiaries?id=in.(${apiaryIds.join(",")})&select=id,description`,
    { headers }
  );
  if (!apiariesRes.ok) {
    throw new Error(`Legacy apiaries: HTTP ${apiariesRes.status} ${await apiariesRes.text()}`);
  }
  const apiaries = await apiariesRes.json();
  const sidecars = new Map();
  for (const apiary of apiaries) {
    const { stacks } = parseHiveStacksFromDescription(apiary.description);
    sidecars.set(apiary.id, stacks);
  }

  const byName = new Map();
  for (const hive of hives) {
    const fromColumns = inventoryFromRow(hive);
    const fromSidecar = sidecars.get(hive.apiary_id)?.[hive.id] ?? null;
    const inventory =
      fromColumns && (fromColumns.medium > 0 || fromColumns.shallow > 0)
        ? fromColumns
        : fromSidecar;
    if (!inventory || (inventory.medium === 0 && inventory.shallow === 0)) continue;
    byName.set(hive.name.trim().toLowerCase(), inventory);
  }
  return byName;
}

async function queryProduction(token, projectRef, sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": UA,
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${body.slice(0, 500)}`);
  }
  return JSON.parse(body);
}

async function main() {
  const legacyUrl = process.env.LEGACY_SUPABASE_URL?.trim();
  const legacyServiceRole = process.env.LEGACY_SUPABASE_SERVICE_ROLE?.trim();
  const token =
    process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
    process.env.SUPABASE_PAT?.trim();
  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() || "vbusjzjtiiflmspxasoi";

  if (!legacyUrl || !legacyServiceRole) {
    console.error("Missing LEGACY_SUPABASE_URL or LEGACY_SUPABASE_SERVICE_ROLE");
    process.exit(1);
  }
  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PAT");
    process.exit(1);
  }

  console.log("Reading legacy super counts...");
  const legacyByName = await fetchLegacyStacks(legacyUrl, legacyServiceRole);
  if (legacyByName.size === 0) {
    console.log("No legacy super counts found.");
    return;
  }

  console.log(`Found ${legacyByName.size} hive(s) with supers on legacy project:`);
  for (const [name, inventory] of legacyByName) {
    console.log(`  - ${name}: ${inventory.medium} medium, ${inventory.shallow} shallow`);
  }

  const targetHives = await queryProduction(
    token,
    projectRef,
    "select id, name from hives order by created_at"
  );

  let updated = 0;
  for (const hive of targetHives) {
    const inventory = legacyByName.get(hive.name.trim().toLowerCase());
    if (!inventory) continue;
    const sql = `update hives set medium_count = ${inventory.medium}, shallow_count = ${inventory.shallow}, super_count = ${inventory.medium + inventory.shallow}, updated_at = now() where id = '${hive.id}'`;
    await queryProduction(token, projectRef, sql);
    console.log(`✓ restored ${hive.name}`);
    updated += 1;
  }

  console.log(`Done. Updated ${updated} hive(s).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

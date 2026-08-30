#!/usr/bin/env node
/**
 * Copy missing hives (and their inspections) from legacy Supabase into production.
 *
 * Requires:
 *   LEGACY_SUPABASE_URL
 *   LEGACY_SUPABASE_SERVICE_ROLE
 *   SUPABASE_ACCESS_TOKEN or SUPABASE_PAT
 *
 * Optional:
 *   SUPABASE_PROJECT_REF (default vbusjzjtiiflmspxasoi)
 *   RESTORE_USER_EMAIL (default treyp8905@gmail.com)
 */

import { parseHiveStacksFromDescription } from "../src/lib/hive-stack-store.ts";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function sqlLiteral(value) {
  if (value == null) return "null";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function legacyFetch(url, serviceRole, path) {
  const res = await fetch(`${url}${path}`, {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
    },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Legacy ${path}: HTTP ${res.status} ${body}`);
  return JSON.parse(body);
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
  if (!res.ok) throw new Error(`HTTP ${res.status} ${body.slice(0, 800)}`);
  return JSON.parse(body);
}

async function getLegacyUserId(url, serviceRole, email) {
  const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
    },
  });
  const data = await res.json();
  const users = data.users ?? data;
  const match = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!match) throw new Error(`Legacy user not found for ${email}`);
  return match.id;
}

function inventoryForHive(hive, sidecarStacks) {
  const fromSidecar = sidecarStacks[hive.id];
  if (fromSidecar) return fromSidecar;
  return { medium: 0, shallow: 0 };
}

async function main() {
  const legacyUrl = process.env.LEGACY_SUPABASE_URL?.trim();
  const legacyServiceRole = process.env.LEGACY_SUPABASE_SERVICE_ROLE?.trim();
  const token =
    process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
    process.env.SUPABASE_PAT?.trim();
  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() || "vbusjzjtiiflmspxasoi";
  const userEmail = process.env.RESTORE_USER_EMAIL?.trim() || "treyp8905@gmail.com";

  if (!legacyUrl || !legacyServiceRole || !token) {
    console.error("Missing LEGACY_SUPABASE_URL, LEGACY_SUPABASE_SERVICE_ROLE, or SUPABASE_PAT");
    process.exit(1);
  }

  const legacyUserId = await getLegacyUserId(legacyUrl, legacyServiceRole, userEmail);
  const legacyApiaries = await legacyFetch(
    legacyUrl,
    legacyServiceRole,
    `/rest/v1/apiaries?user_id=eq.${legacyUserId}&select=id,name,description`
  );
  if (legacyApiaries.length === 0) {
    console.log("No legacy apiaries for user.");
    return;
  }

  const productionUsers = await queryProduction(
    token,
    projectRef,
    `select id from auth.users where lower(email) = lower(${sqlLiteral(userEmail)}) limit 1`
  );
  if (!productionUsers[0]?.id) {
    throw new Error(`Production user not found for ${userEmail}`);
  }
  const productionUserId = productionUsers[0].id;

  const productionApiaries = await queryProduction(
    token,
    projectRef,
    `select id, name, description from apiaries where user_id = ${sqlLiteral(productionUserId)} order by created_at`
  );
  const productionApiary =
    productionApiaries.find((row) => row.name === legacyApiaries[0].name) ??
    productionApiaries[0];
  if (!productionApiary) throw new Error("No production apiary found for user");

  const productionHives = await queryProduction(
    token,
    projectRef,
    `select id, name from hives where apiary_id = ${sqlLiteral(productionApiary.id)}`
  );
  const productionByName = new Map(
    productionHives.map((hive) => [hive.name.trim().toLowerCase(), hive])
  );

  let insertedHives = 0;
  const hiveIdMap = new Map();

  for (const legacyApiary of legacyApiaries) {
    const { stacks } = parseHiveStacksFromDescription(legacyApiary.description);
    const legacyHives = await legacyFetch(
      legacyUrl,
      legacyServiceRole,
      `/rest/v1/hives?apiary_id=eq.${legacyApiary.id}&select=id,name,status,frame_count,created_at,updated_at`
    );

    for (const legacyHive of legacyHives) {
      const key = legacyHive.name.trim().toLowerCase();
      const existing = productionByName.get(key);
      if (existing) {
        hiveIdMap.set(legacyHive.id, existing.id);
        continue;
      }

      const inventory = inventoryForHive(legacyHive, stacks);
      const superCount = inventory.medium + inventory.shallow;
      const insertSql = `
        insert into hives (
          apiary_id, name, status, frame_count,
          medium_count, shallow_count, super_count,
          created_at, updated_at
        ) values (
          ${sqlLiteral(productionApiary.id)},
          ${sqlLiteral(legacyHive.name)},
          ${sqlLiteral(legacyHive.status ?? "active")},
          ${legacyHive.frame_count ?? 10},
          ${inventory.medium},
          ${inventory.shallow},
          ${superCount},
          ${sqlLiteral(legacyHive.created_at)},
          ${sqlLiteral(legacyHive.updated_at ?? legacyHive.created_at)}
        )
        returning id
      `;
      const inserted = await queryProduction(token, projectRef, insertSql);
      const newId = inserted[0]?.id;
      if (!newId) throw new Error(`Failed to insert hive ${legacyHive.name}`);
      hiveIdMap.set(legacyHive.id, newId);
      productionByName.set(key, { id: newId, name: legacyHive.name });
      console.log(`✓ inserted hive ${legacyHive.name} (${inventory.medium} medium, ${inventory.shallow} shallow)`);
      insertedHives += 1;
    }
  }

  const existingInspections = await queryProduction(
    token,
    projectRef,
    `select h.name, i.date::text as date, coalesce(i.notes, '') as notes
     from inspections i
     join hives h on h.id = i.hive_id
     where h.apiary_id = ${sqlLiteral(productionApiary.id)}`
  );
  const inspectionKeys = new Set(
    existingInspections.map(
      (row) =>
        `${row.name.trim().toLowerCase()}|${row.date}|${row.notes.trim().slice(0, 80)}`
    )
  );

  const legacyHiveIds = [...hiveIdMap.keys()];
  if (legacyHiveIds.length === 0) {
    console.log("No hives to map.");
    return;
  }

  const legacyInspections = await legacyFetch(
    legacyUrl,
    legacyServiceRole,
    `/rest/v1/inspections?hive_id=in.(${legacyHiveIds.join(",")})&select=*`
  );
  const legacyHiveNames = new Map();
  for (const legacyApiary of legacyApiaries) {
    const legacyHives = await legacyFetch(
      legacyUrl,
      legacyServiceRole,
      `/rest/v1/hives?apiary_id=eq.${legacyApiary.id}&select=id,name`
    );
    for (const hive of legacyHives) legacyHiveNames.set(hive.id, hive.name);
  }

  let insertedInspections = 0;
  for (const inspection of legacyInspections) {
    const hiveName = legacyHiveNames.get(inspection.hive_id);
    const productionHiveId = hiveIdMap.get(inspection.hive_id);
    if (!hiveName || !productionHiveId) continue;

    const dedupeKey = `${hiveName.trim().toLowerCase()}|${inspection.date}|${(inspection.notes ?? "").trim().slice(0, 80)}`;
    if (inspectionKeys.has(dedupeKey)) continue;

    const columns = [
      "hive_id",
      "date",
      "queen_spotted",
      "brood_pattern",
      "temperament",
      "notes",
      "created_by",
      "created_at",
      "updated_at",
      "inspection_time",
      "weather",
      "temperature_f",
      "queen_sighted",
      "queen_mark_color",
      "eggs_larvae",
      "honey_stores",
      "pollen_stores",
      "mite_count_per_100",
      "pests_diseases",
      "action_fed",
      "action_super",
      "action_split",
      "action_treatment",
    ];
    const values = [
      sqlLiteral(productionHiveId),
      sqlLiteral(inspection.date),
      inspection.queen_spotted ?? false,
      sqlLiteral(inspection.brood_pattern ?? "good"),
      sqlLiteral(inspection.temperament ?? "calm"),
      sqlLiteral(inspection.notes),
      sqlLiteral(productionUserId),
      sqlLiteral(inspection.created_at),
      sqlLiteral(inspection.updated_at ?? inspection.created_at),
      sqlLiteral(inspection.inspection_time),
      sqlLiteral(inspection.weather),
      inspection.temperature_f ?? "null",
      sqlLiteral(inspection.queen_sighted ?? "no"),
      sqlLiteral(inspection.queen_mark_color ?? "unmarked"),
      sqlLiteral(inspection.eggs_larvae ?? "none_observed"),
      sqlLiteral(inspection.honey_stores ?? "moderate"),
      sqlLiteral(inspection.pollen_stores ?? "low"),
      inspection.mite_count_per_100 ?? "null",
      sqlLiteral(inspection.pests_diseases ?? "none"),
      inspection.action_fed ?? false,
      inspection.action_super ?? false,
      inspection.action_split ?? false,
      inspection.action_treatment ?? false,
    ];

    await queryProduction(
      token,
      projectRef,
      `insert into inspections (${columns.join(", ")}) values (${values.join(", ")})`
    );
    inspectionKeys.add(dedupeKey);
    console.log(`✓ inserted inspection ${hiveName} ${inspection.date}`);
    insertedInspections += 1;
  }

  console.log(
    `Done. Inserted ${insertedHives} hive(s) and ${insertedInspections} inspection(s).`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

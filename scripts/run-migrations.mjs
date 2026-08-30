#!/usr/bin/env node
/**
 * Apply pending Supabase SQL migrations to the hosted database.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const PENDING = [
  "20260814000000_hive_supers.sql",
  "20260815000000_super_types.sql",
  "20260815120000_ensure_supers.sql",
  "20260830100000_phase1_features.sql",
  "20260831100000_phase2_field_workflow.sql",
  "20260901100000_phase3_lifecycle_reminders.sql",
];

async function runViaManagementApi(token, projectRef, files) {
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
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
      throw new Error(`${file}: HTTP ${res.status} ${body.slice(0, 500)}`);
    }
    console.log(`✓ ${file} (HTTP ${res.status})`);
  }
}

async function verify(token, projectRef) {
  const checks = [
    "SELECT column_name FROM information_schema.columns WHERE table_name='hives' AND column_name='medium_count'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='hives' AND column_name='notes'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='inspections' AND column_name='split_type'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='hives' AND column_name='queen_introduced_date'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='treatments' AND column_name='mite_retest_due_date'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='inspections' AND column_name='queen_cells_seen'",
  ];
  for (const query of checks) {
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
        body: JSON.stringify({ query }),
      }
    );
    const body = await res.json();
    if (!res.ok || !Array.isArray(body) || body.length === 0) {
      throw new Error(`Verification failed for: ${query}`);
    }
    console.log(`✓ verified ${body[0].column_name}`);
  }
}

async function main() {
  const token =
    process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
    process.env.SUPABASE_PAT?.trim();
  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([a-z0-9]+)\.supabase\.co/
    )?.[1] ||
    "vbusjzjtiiflmspxasoi";

  const available = new Set(
    readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql"))
  );
  const pending = PENDING.filter((f) => available.has(f));

  console.log(`Applying ${pending.length} migration(s)...`);

  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PAT");
    process.exit(1);
  }

  await runViaManagementApi(token, projectRef, pending);
  await verify(token, projectRef);
  console.log("All migrations applied and verified.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

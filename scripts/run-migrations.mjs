#!/usr/bin/env node
/**
 * Apply pending Supabase SQL migrations to the hosted database.
 *
 * Supports either:
 *   SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF  (Management API)
 *   DATABASE_URL or SUPABASE_DB_URL                 (supabase db push)
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:migrate -- --only 20260830100000_phase1_features.sql
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const onlyArg = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

function listMigrations() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (onlyArg) {
    if (!files.includes(onlyArg)) {
      throw new Error(`Migration not found: ${onlyArg}`);
    }
    return [onlyArg];
  }
  return files;
}

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
      throw new Error(
        `${file}: HTTP ${res.status} ${body.slice(0, 500)}`
      );
    }
    console.log(`✓ ${file} (HTTP ${res.status})`);
  }
}

function runViaDbUrl(dbUrl, files) {
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const child = spawnSync(
      "npx",
      ["--yes", "supabase@latest", "db", "execute", "--db-url", dbUrl, sql],
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    if (child.status !== 0) {
      throw new Error(
        `${file}: ${child.stderr || child.stdout || "db execute failed"}`
      );
    }
    console.log(`✓ ${file}`);
  }
}

async function verifyViaManagementApi(token, projectRef) {
  const checks = [
    "SELECT column_name FROM information_schema.columns WHERE table_name='hives' AND column_name='notes'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='apiaries' AND column_name='harvest_goal_lbs'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='inspections' AND column_name='split_type'",
    "SELECT column_name FROM information_schema.columns WHERE table_name='inspections' AND column_name='mite_method'",
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
    )?.[1];
  const dbUrl =
    process.env.DATABASE_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim();

  const pending = [
    "20260830100000_phase1_features.sql",
    "20260831100000_phase2_field_workflow.sql",
  ].filter((f) => listMigrations().includes(f));

  if (onlyArg) {
    pending.length = 0;
    pending.push(onlyArg);
  }

  console.log(`Applying ${pending.length} migration(s)...`);

  if (token && projectRef) {
    await runViaManagementApi(token, projectRef, pending);
    await verifyViaManagementApi(token, projectRef);
    console.log("All migrations applied and verified.");
    return;
  }

  if (dbUrl) {
    runViaDbUrl(dbUrl, pending);
    console.log("All migrations applied.");
    return;
  }

  console.error(
    [
      "Missing database credentials. Set one of:",
      "  SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF (or NEXT_PUBLIC_SUPABASE_URL)",
      "  DATABASE_URL or SUPABASE_DB_URL",
      "",
      "Production project ref: vbusjzjtiiflmspxasoi",
    ].join("\n")
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

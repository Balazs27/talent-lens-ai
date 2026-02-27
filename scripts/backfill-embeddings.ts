/**
 * One-time backfill: generate embeddings for all resumes and jobs
 * where embedding IS NULL and status = 'ready'.
 *
 * Usage (from repo root):
 *   npx tsx scripts/backfill-embeddings.ts
 *
 * Reads env vars from .env.local automatically.
 * Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

// ── Validate required env vars ────────────────────────────────
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
] as const

const missing = REQUIRED.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(
    `[backfill-embeddings] Missing required environment variables:\n  ${missing.join("\n  ")}\n\n` +
    `Set them before running:\n` +
    `  NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... npx tsx scripts/backfill-embeddings.ts`
  )
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey   = process.env.OPENAI_API_KEY!

// ── Clients ───────────────────────────────────────────────────
const db     = createClient(supabaseUrl, serviceKey)
const openai = new OpenAI({ apiKey: openaiKey })

const MAX_CHARS = 8000

async function embed(text: string): Promise<number[]> {
  const sanitized = text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS)
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: sanitized,
    encoding_format: "float",
  })
  return res.data[0].embedding
}

// ── Backfill one table ────────────────────────────────────────
async function backfillTable(table: "resumes" | "jobs") {
  const { data: rows, error } = await db
    .from(table)
    .select("id, raw_text")
    .eq("status", "ready")
    .is("embedding", null)

  if (error) {
    console.error(`[${table}] Failed to fetch rows:`, error.message)
    return
  }
  if (!rows || rows.length === 0) {
    console.log(`[${table}] Nothing to backfill.`)
    return
  }

  console.log(`[${table}] Backfilling ${rows.length} row(s)...`)

  for (const row of rows) {
    try {
      const embedding = await embed(row.raw_text as string)
      const { error: updateError } = await db
        .from(table)
        .update({ embedding })
        .eq("id", row.id)

      if (updateError) throw new Error(updateError.message)
      console.log(`[${table}] ✓ ${row.id}`)
    } catch (err) {
      console.error(
        `[${table}] ✗ ${row.id}:`,
        err instanceof Error ? err.message : err
      )
    }
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log("[backfill-embeddings] Starting...")
  await backfillTable("resumes")
  await backfillTable("jobs")
  console.log("[backfill-embeddings] Done.")
}

main().catch((err) => {
  console.error("[backfill-embeddings] Fatal:", err)
  process.exit(1)
})

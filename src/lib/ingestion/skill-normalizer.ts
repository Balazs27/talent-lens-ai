import type { SupabaseClient } from "@supabase/supabase-js"
import type { SkillRow } from "@/lib/types/skill"

export interface NormalizationResult {
  skillId: number
  canonicalName: string
  category: string
  originalName: string
}

/**
 * Normalize a skill name for matching purposes.
 * Strips common variations so "React.js", "ReactJS", and "React" all produce "react".
 */
export function normalizeForMatching(name: string): string {
  let s = name.trim().toLowerCase()

  // Strip trailing ".js", ".ts", ".io" suffixes (but not from standalone names like "js")
  if (s.length > 3) {
    s = s.replace(/\.js$/i, "")
    s = s.replace(/\.ts$/i, "")
    s = s.replace(/\.io$/i, "")
  }

  // Collapse "JS"/"TS" suffixes when attached to a word: "reactjs" → "react", "angularjs" → "angular"
  // But preserve standalone "js", "ts", "css", "sql" etc.
  if (s.length > 4) {
    s = s.replace(/js$/i, "")
    s = s.replace(/ts$/i, "")
  }

  // Normalize separators: replace hyphens, slashes, dots, underscores with spaces
  s = s.replace(/[-/._ ]+/g, " ")

  // Collapse multiple spaces
  s = s.replace(/\s+/g, " ").trim()

  return s
}

/**
 * Resolve extracted skill names to canonical skills, auto-creating any that
 * don't yet exist in the taxonomy.
 *
 * Flow per name:
 *   1. Exact case-insensitive match on canonical_name
 *   2. Case-insensitive match on aliases
 *   3. Normalized fuzzy match (strips .js/.ts suffixes, collapses separators)
 *   4. Normalized match against aliases
 *   5. If still unmatched → INSERT via adminClient (bypasses RLS), then fetch back
 *
 * The adminClient (service role) is required because the skills table has no
 * INSERT RLS policy for authenticated users.
 *
 * Deduplicates by skill_id so the same canonical skill is never returned twice.
 */
export async function findOrCreateSkills(
  adminClient: SupabaseClient,
  supabase: SupabaseClient,
  extractedNames: string[]
): Promise<NormalizationResult[]> {
  if (extractedNames.length === 0) return []

  // 1. Load the full taxonomy once (authenticated client — SELECT is allowed)
  const { data: skills, error } = await supabase
    .from("skills")
    .select("id, canonical_name, category, aliases")

  if (error || !skills) {
    throw new Error(`Failed to fetch skills taxonomy: ${error?.message}`)
  }

  const taxonomy = skills as SkillRow[]
  const results: NormalizationResult[] = []
  const seen = new Set<number>()

  // Pre-compute normalized keys for the entire taxonomy (once)
  const taxonomyNormalized = taxonomy.map((skill) => ({
    skill,
    normalizedCanonical: normalizeForMatching(skill.canonical_name),
    normalizedAliases: (skill.aliases ?? []).map(normalizeForMatching),
  }))

  // Track names that need auto-creation; keyed by normalized form for dedup
  const toCreate: { name: string; originalName: string; normalizedKey: string }[] = []
  const pendingKeys = new Set<string>()

  // 2. Match each name against the existing taxonomy
  for (const rawName of extractedNames) {
    const trimmed = rawName.trim()
    if (!trimmed) continue

    const match = findMatch(trimmed, taxonomy, taxonomyNormalized)
    if (match && !seen.has(match.id)) {
      seen.add(match.id)
      results.push({
        skillId: match.id,
        canonicalName: match.canonical_name,
        category: match.category,
        originalName: rawName,
      })
    } else if (!match) {
      const normalizedKey = normalizeForMatching(trimmed)
      if (!pendingKeys.has(normalizedKey)) {
        pendingKeys.add(normalizedKey)
        toCreate.push({ name: trimmed, originalName: rawName, normalizedKey })
      }
    }
  }

  if (toCreate.length === 0) return results

  // 3. Before inserting, check if any pending skills already exist by normalized_key.
  //    This catches cases where canonical_name differs but normalized form matches
  //    (e.g., "React.js" in DB vs "ReactJS" being created).
  const { data: existingByKey, error: keyError } = await adminClient
    .from("skills")
    .select("id, canonical_name, category, aliases, normalized_key")
    .in("normalized_key", toCreate.map((c) => c.normalizedKey))

  if (keyError) {
    throw new Error(`Failed to check existing skills: ${keyError.message}`)
  }

  // Map normalized_key → existing skill for quick lookup
  const existingKeyMap = new Map<string, SkillRow>()
  if (existingByKey) {
    for (const row of existingByKey as (SkillRow & { normalized_key: string })[]) {
      existingKeyMap.set(row.normalized_key, row)
    }
  }

  // Separate into "already exists (by normalized_key)" vs "truly new"
  const trulyNew: typeof toCreate = []
  for (const item of toCreate) {
    const existing = existingKeyMap.get(item.normalizedKey)
    if (existing && !seen.has(existing.id)) {
      seen.add(existing.id)
      results.push({
        skillId: existing.id,
        canonicalName: existing.canonical_name,
        category: existing.category,
        originalName: item.originalName,
      })
    } else if (!existing) {
      trulyNew.push(item)
    }
  }

  if (trulyNew.length === 0) return results

  // 4. Insert truly new skills via admin client (ignoreDuplicates handles races)
  const { error: upsertError } = await adminClient
    .from("skills")
    .upsert(
      trulyNew.map(({ name }) => ({
        canonical_name: name,
        category: "general",
        aliases: [] as string[],
      })),
      { onConflict: "canonical_name", ignoreDuplicates: true }
    )

  if (upsertError) {
    throw new Error(`Failed to auto-create skills: ${upsertError.message}`)
  }

  // 5. Fetch the now-existing rows (handles race-condition survivors too)
  //    Use normalized_key lookup since canonical_name casing might vary
  const { data: created, error: fetchError } = await adminClient
    .from("skills")
    .select("id, canonical_name, category, aliases, normalized_key")
    .in("normalized_key", trulyNew.map((c) => c.normalizedKey))

  if (fetchError || !created) {
    throw new Error(`Failed to fetch auto-created skills: ${fetchError?.message}`)
  }

  // 6. Build a lookup from normalized_key → original extracted name
  const keyToOriginal = new Map(
    trulyNew.map(({ normalizedKey, originalName }) => [normalizedKey, originalName])
  )

  for (const skill of created as (SkillRow & { normalized_key: string })[]) {
    if (!seen.has(skill.id)) {
      seen.add(skill.id)
      results.push({
        skillId: skill.id,
        canonicalName: skill.canonical_name,
        category: skill.category,
        originalName: keyToOriginal.get(skill.normalized_key) ?? skill.canonical_name,
      })
    }
  }

  return results
}

/**
 * Read-only variant — matches against the existing taxonomy only.
 * Unknown skills are silently ignored. Kept for any future read-only
 * context that does not need auto-creation.
 */
export async function normalizeSkills(
  supabase: SupabaseClient,
  extractedNames: string[]
): Promise<NormalizationResult[]> {
  const { data: skills, error } = await supabase
    .from("skills")
    .select("id, canonical_name, category, aliases")

  if (error || !skills) {
    throw new Error(`Failed to fetch skills taxonomy: ${error?.message}`)
  }

  const taxonomy = skills as SkillRow[]
  const taxonomyNormalized = taxonomy.map((skill) => ({
    skill,
    normalizedCanonical: normalizeForMatching(skill.canonical_name),
    normalizedAliases: (skill.aliases ?? []).map(normalizeForMatching),
  }))
  const results: NormalizationResult[] = []
  const seen = new Set<number>()

  for (const rawName of extractedNames) {
    const trimmed = rawName.trim()
    if (!trimmed) continue

    const match = findMatch(trimmed, taxonomy, taxonomyNormalized)
    if (match && !seen.has(match.id)) {
      seen.add(match.id)
      results.push({
        skillId: match.id,
        canonicalName: match.canonical_name,
        category: match.category,
        originalName: rawName,
      })
    }
  }

  return results
}

interface NormalizedTaxonomyEntry {
  skill: SkillRow
  normalizedCanonical: string
  normalizedAliases: string[]
}

function findMatch(
  name: string,
  skills: SkillRow[],
  taxonomyNormalized: NormalizedTaxonomyEntry[]
): SkillRow | null {
  const lower = name.toLowerCase()
  const normalized = normalizeForMatching(name)

  // Pass 1: Exact case-insensitive match on canonical_name
  for (const skill of skills) {
    if (skill.canonical_name.toLowerCase() === lower) {
      return skill
    }
  }

  // Pass 2: Exact case-insensitive match on aliases
  for (const skill of skills) {
    if (skill.aliases?.some((alias) => alias.toLowerCase() === lower)) {
      return skill
    }
  }

  // Pass 3: Normalized match on canonical_name (catches "React.js" → "react" = "React" → "react")
  for (const entry of taxonomyNormalized) {
    if (entry.normalizedCanonical === normalized) {
      return entry.skill
    }
  }

  // Pass 4: Normalized match on aliases
  for (const entry of taxonomyNormalized) {
    if (entry.normalizedAliases.some((a) => a === normalized)) {
      return entry.skill
    }
  }

  return null
}

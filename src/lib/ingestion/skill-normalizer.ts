import type { SupabaseClient } from "@supabase/supabase-js"
import type { SkillRow } from "@/lib/types/skill"

export interface NormalizationResult {
  skillId: number
  canonicalName: string
  category: string
  originalName: string
}

/**
 * Match extracted skill names against the skills taxonomy.
 * Case-insensitive match on canonical_name, then aliases.
 * Unknown skills are silently ignored.
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
  const results: NormalizationResult[] = []
  const seen = new Set<number>()

  for (const rawName of extractedNames) {
    const trimmed = rawName.trim()
    if (!trimmed) continue

    const match = findMatch(trimmed, taxonomy)
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

function findMatch(name: string, skills: SkillRow[]): SkillRow | null {
  const lower = name.toLowerCase()

  // 1. Exact match on canonical_name (case-insensitive)
  for (const skill of skills) {
    if (skill.canonical_name.toLowerCase() === lower) {
      return skill
    }
  }

  // 2. Match against aliases array (case-insensitive)
  for (const skill of skills) {
    if (skill.aliases?.some((alias) => alias.toLowerCase() === lower)) {
      return skill
    }
  }

  return null
}

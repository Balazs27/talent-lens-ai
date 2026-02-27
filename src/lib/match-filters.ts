import type { JobMatch } from "@/components/match-list"
import type { CandidateMatch } from "@/components/candidate-list"

export type SortField = "hybrid" | "semantic" | "deterministic"

export interface MatchFilterState {
  searchQuery: string
  location: string       // employee only; empty string = all
  minMatchPercent: number // 0–100, default 0
  sortBy: SortField
}

export const DEFAULT_FILTERS: MatchFilterState = {
  searchQuery: "",
  location: "",
  minMatchPercent: 0,
  sortBy: "hybrid",
}

export function filterJobMatches(
  matches: JobMatch[],
  filters: MatchFilterState
): JobMatch[] {
  let result = matches

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase()
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.company ?? "").toLowerCase().includes(q)
    )
  }

  if (filters.location.trim()) {
    const loc = filters.location.toLowerCase()
    result = result.filter(
      (m) => (m.location ?? "").toLowerCase().includes(loc)
    )
  }

  if (filters.minMatchPercent > 0) {
    result = result.filter(
      (m) => Math.round(m.hybrid_score * 100) >= filters.minMatchPercent
    )
  }

  return sortItems(result, filters.sortBy)
}

export function filterCandidateMatches(
  candidates: CandidateMatch[],
  filters: MatchFilterState
): CandidateMatch[] {
  let result = candidates

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase()
    result = result.filter((c) => c.full_name.toLowerCase().includes(q))
  }

  if (filters.minMatchPercent > 0) {
    result = result.filter(
      (c) => Math.round(c.hybrid_score * 100) >= filters.minMatchPercent
    )
  }

  return sortItems(result, filters.sortBy)
}

function sortItems<T extends {
  hybrid_score: number
  semantic_similarity: number
  deterministic_score_normalized: number
}>(items: T[], sortBy: SortField): T[] {
  const key =
    sortBy === "hybrid"
      ? "hybrid_score"
      : sortBy === "semantic"
        ? "semantic_similarity"
        : "deterministic_score_normalized"
  return [...items].sort((a, b) => b[key] - a[key])
}

export function computeSkillCoverage(
  matchedRequired: number,
  matchedPreferred: number,
  matchedNiceToHave: number,
  totalSkills: number
): number {
  if (totalSkills === 0) return 0
  return Math.round(
    ((matchedRequired + matchedPreferred + matchedNiceToHave) / totalSkills) * 100
  )
}

export function extractLocations(matches: JobMatch[]): string[] {
  const locs = new Set<string>()
  for (const m of matches) {
    if (m.location) locs.add(m.location)
  }
  return Array.from(locs).sort()
}

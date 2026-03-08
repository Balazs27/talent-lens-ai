/**
 * Deterministic JD text highlighter.
 * Segments raw JD text into typed runs so the UI can render
 * matched skills (green) and missing required skills (red)
 * without any LLM involvement.
 */

export type SegmentKind = "text" | "matched" | "missing"

export interface TextSegment {
  kind: SegmentKind
  text: string
}

/**
 * Escape special regex metacharacters so skill names like
 * "C#", ".NET", "Node.js", "React.js" are matched literally.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Build a single regex that matches any of the given terms,
 * sorted longest-first so "machine learning" beats "learning".
 * Uses word-boundary anchors to avoid partial matches inside words.
 * Special case: terms ending in non-word chars (C#, .NET) don't
 * use a trailing \b because \b doesn't work there.
 */
function buildPattern(terms: string[]): RegExp | null {
  if (terms.length === 0) return null

  const sorted = [...terms].sort((a, b) => b.length - a.length)

  const parts = sorted.map((t) => {
    const escaped = escapeRegex(t)
    // Leading boundary: if term starts with a word char use \b, else (?<!\w)
    const leadBoundary = /^\w/.test(t) ? "\\b" : "(?<!\\w)"
    // Trailing boundary: if term ends with a word char use \b, else (?!\w)
    const trailBoundary = /\w$/.test(t) ? "\\b" : "(?!\\w)"
    return `${leadBoundary}${escaped}${trailBoundary}`
  })

  return new RegExp(`(${parts.join("|")})`, "gi")
}

/**
 * Segment `rawText` into typed runs.
 *
 * Priority: if a term appears in both lists, "matched" wins
 * (the candidate already has the skill — it would be confusing
 * to show it red when they have it).
 */
export function segmentJdText(
  rawText: string,
  matchedSkillNames: string[],
  missingRequiredSkillNames: string[],
): TextSegment[] {
  // Normalise to lower-case sets for O(1) lookup
  const matchedSet = new Set(matchedSkillNames.map((s) => s.toLowerCase()))
  const missingSet = new Set(missingRequiredSkillNames.map((s) => s.toLowerCase()))

  // Combine all terms into one pattern so we scan the text once
  const allTerms = Array.from(new Set([...matchedSkillNames, ...missingRequiredSkillNames]))
  const pattern = buildPattern(allTerms)

  if (!pattern) return [{ kind: "text", text: rawText }]

  const segments: TextSegment[] = []
  let lastIndex = 0

  // Reset lastIndex just in case
  pattern.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = pattern.exec(rawText)) !== null) {
    const start = match.index
    const end = start + match[0].length
    const matched = match[0]
    const lower = matched.toLowerCase()

    // Push any plain text before this match
    if (start > lastIndex) {
      segments.push({ kind: "text", text: rawText.slice(lastIndex, start) })
    }

    // Classify: matched wins over missing
    let kind: SegmentKind = "text"
    if (matchedSet.has(lower)) {
      kind = "matched"
    } else if (missingSet.has(lower)) {
      kind = "missing"
    } else {
      // Alias check: see if lower is a substring of any entry or vice-versa
      // (handles "Postgres" matching "PostgreSQL" etc. when extracted name differs)
      for (const m of matchedSet) {
        if (m.includes(lower) || lower.includes(m)) {
          kind = "matched"
          break
        }
      }
      if (kind === "text") {
        for (const m of missingSet) {
          if (m.includes(lower) || lower.includes(m)) {
            kind = "missing"
            break
          }
        }
      }
    }

    segments.push({ kind, text: matched })
    lastIndex = end
  }

  // Trailing plain text
  if (lastIndex < rawText.length) {
    segments.push({ kind: "text", text: rawText.slice(lastIndex) })
  }

  return segments
}

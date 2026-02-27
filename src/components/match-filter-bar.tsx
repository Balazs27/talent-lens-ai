"use client"

import type { SortField, MatchFilterState } from "@/lib/match-filters"

interface MatchFilterBarProps {
  filters: MatchFilterState
  onFiltersChange: (next: MatchFilterState) => void
  searchPlaceholder: string
  locations?: string[]   // when provided, shows location dropdown
  filteredCount: number
  totalCount: number
}

export function MatchFilterBar({
  filters,
  onFiltersChange,
  searchPlaceholder,
  locations,
  filteredCount,
  totalCount,
}: MatchFilterBarProps) {
  const set = <K extends keyof MatchFilterState>(key: K, value: MatchFilterState[K]) =>
    onFiltersChange({ ...filters, [key]: value })

  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-4 flex flex-wrap items-center gap-3">

      {/* Search */}
      <input
        type="text"
        value={filters.searchQuery}
        onChange={(e) => set("searchQuery", e.target.value)}
        placeholder={searchPlaceholder}
        className="flex-1 min-w-40 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      />

      {/* Location dropdown (employee only) */}
      {locations && locations.length > 0 && (
        <select
          value={filters.location}
          onChange={(e) => set("location", e.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      )}

      {/* Min match % */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 whitespace-nowrap">Min match</label>
        <input
          type="number"
          min={0}
          max={100}
          step={5}
          value={filters.minMatchPercent}
          onChange={(e) => set("minMatchPercent", Math.min(100, Math.max(0, Number(e.target.value))))}
          className="w-16 rounded-xl border border-slate-200 bg-white/80 px-2 py-2 text-sm text-slate-700 text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <span className="text-xs text-slate-400">%</span>
      </div>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => set("sortBy", e.target.value as SortField)}
        className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      >
        <option value="hybrid">Best Match</option>
        <option value="semantic">Semantic Fit</option>
        <option value="deterministic">Skill Match</option>
      </select>

      {/* Count */}
      <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
        {filteredCount === totalCount
          ? `${totalCount} result${totalCount !== 1 ? "s" : ""}`
          : `${filteredCount} of ${totalCount}`}
      </span>
    </div>
  )
}

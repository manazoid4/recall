"use client";

import { useState, useCallback } from "react";
import { Search, Globe, SlidersHorizontal, X } from "lucide-react";

export interface SearchBarProps {
  onSearch: (query: string, options: SearchOptions) => void;
  sources?: string[];
  categories?: string[];
  tags?: string[];
  entities?: string[];
}

export interface SearchOptions {
  query: string;
  mode: "fulltext" | "semantic";
  source?: string;
  category?: string;
  tag?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function SearchBar({
  onSearch,
  sources = [],
  categories = [],
  tags = [],
  entities = [],
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"fulltext" | "semantic">("fulltext");
  const [showFacets, setShowFacets] = useState(false);
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [entity, setEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSearch = useCallback(() => {
    onSearch(query, { query, mode, source, category, tag, entity, dateFrom, dateTo });
  }, [query, mode, source, category, tag, entity, dateFrom, dateTo, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setSource("");
    setCategory("");
    setTag("");
    setEntity("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = source || category || tag || entity || dateFrom || dateTo;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your saved brain..."
            className="w-full rounded-xl border border-line bg-panel py-2.5 pl-10 pr-4 text-sm text-ink placeholder-muted outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
          />
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === "fulltext" ? "semantic" : "fulltext")}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
            mode === "semantic"
              ? "border-yellow bg-yellow/10 text-yellow"
              : "border-line bg-panel text-muted hover:text-ink"
          }`}
          title={mode === "semantic" ? "Semantic search" : "Fulltext search"}
        >
          <Globe className="h-4 w-4" />
          {mode === "semantic" ? "Semantic" : "Fulltext"}
        </button>

        <button
          type="button"
          onClick={() => setShowFacets(!showFacets)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
            showFacets || hasActiveFilters
              ? "border-yellow bg-yellow/10 text-yellow"
              : "border-line bg-panel text-muted hover:text-ink"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow text-[10px] font-bold text-ink">
              !
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink/80"
        >
          Search
        </button>
      </div>

      {showFacets && (
        <div className="mt-3 rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink">Facets</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {sources.length > 0 && (
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-yellow"
              >
                <option value="">All sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {categories.length > 0 && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-yellow"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {tags.length > 0 && (
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-yellow"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {entities.length > 0 && (
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-yellow"
              >
                <option value="">All entities</option>
                {entities.map((en) => (
                  <option key={en} value={en}>
                    {en}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-yellow"
              placeholder="From"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-yellow"
              placeholder="To"
            />
          </div>
        </div>
      )}
    </div>
  );
}

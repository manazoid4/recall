"use client";

import { useState } from "react";
import {
  ExternalLink,
  Tag,
  Sparkles,
  Hash,
  BookmarkPlus,
  ImageOff,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/date-utils";
import Link from "next/link";

export interface EntityChip {
  id: string;
  label: string;
  type: "person" | "org" | "tool" | "concept" | "location";
}

export interface PostCardProps {
  id: string;
  title: string;
  source: string;
  summary: string;
  insight?: string;
  tags: string[];
  entities: EntityChip[];
  thumbnailUrl?: string;
  originalUrl: string;
  savedAt: string;
  mediaType?: "image" | "video" | "text" | "audio" | "link";
  enrichmentScore?: number;
  onTagClick?: (_tag: string) => void;
  onEntityClick?: (_entity: EntityChip) => void;
  onAddToBoard?: (_id: string) => void;
}

const sourceColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  twitter: "bg-sky-100 text-sky-700",
  tiktok: "bg-gray-100 text-gray-800",
  reddit: "bg-orange-100 text-orange-700",
  x: "bg-gray-900 text-white",
  notion: "bg-gray-100 text-gray-700",
  web: "bg-blue-100 text-blue-700",
  pocket: "bg-rose-100 text-rose-700",
  raindrop: "bg-indigo-100 text-indigo-700",
};

const entityColors: Record<string, string> = {
  person: "bg-violet-100 text-violet-700",
  org: "bg-emerald-100 text-emerald-700",
  tool: "bg-amber-100 text-amber-700",
  concept: "bg-cyan-100 text-cyan-700",
  location: "bg-rose-100 text-rose-700",
};

export default function PostCard({
  id,
  title,
  source,
  summary,
  insight,
  tags,
  entities,
  thumbnailUrl,
  originalUrl,
  savedAt,
  mediaType,
  enrichmentScore,
  onTagClick,
  onEntityClick,
  onAddToBoard,
}: PostCardProps) {
  const [imgError, setImgError] = useState(false);
  const sourceClass =
    sourceColors[source.toLowerCase()] || "bg-gray-100 text-gray-700";

  return (
    <Link href={`/items/${id}`} className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {thumbnailUrl && !imgError ? (
        <div className="relative h-40 w-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          {mediaType && (
            <span className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white capitalize">
              {mediaType}
            </span>
          )}
          {enrichmentScore !== undefined && (
            <span className="absolute left-2 top-2 rounded-md bg-yellow/90 px-2 py-0.5 text-xs font-semibold text-ink">
              {enrichmentScore}%
            </span>
          )}
        </div>
      ) : thumbnailUrl && imgError ? (
        <div className="flex h-40 w-full items-center justify-center bg-surface">
          <ImageOff className="h-8 w-8 text-muted/40" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            {onAddToBoard && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToBoard(id);
                }}
                className="rounded p-1 text-muted transition-colors hover:text-yellow"
                aria-label="Add to board"
              >
                <BookmarkPlus className="h-4 w-4" />
              </button>
            )}
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 text-muted transition-colors hover:text-ink"
              aria-label="Open original link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${sourceClass}`}
          >
            {source}
          </span>
          <time className="text-xs text-muted" dateTime={savedAt}>
            {formatRelativeDate(savedAt)}
          </time>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          {summary}
        </p>

        {insight && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow/10 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
            <p className="text-xs leading-relaxed text-ink">{insight}</p>
          </div>
        )}

        {entities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => onEntityClick?.(entity)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${
                  entityColors[entity.type] || "bg-gray-100 text-gray-700"
                }`}
              >
                <Hash className="h-3 w-3" />
                {entity.label}
              </button>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted transition-colors hover:border-yellow hover:text-ink"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

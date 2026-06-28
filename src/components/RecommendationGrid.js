"use client";

import RecommendationCard from "./RecommendationCard";

// Responsive grid of recommendation cards. Shows a friendly empty state.
export default function RecommendationGrid({ recs, isSaved, onToggleSave, onReset, highlightedId }) {
  if (!recs.length) {
    return (
      <div className="surface mx-auto mt-6 max-w-md p-10 text-center">
        <div className="text-4xl">🫥</div>
        <h3 className="mt-3 font-serif text-xl font-bold">No spots match yet</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Try a different search or clear your filters.
        </p>
        <button type="button" onClick={onReset} className="btn-secondary mt-5">
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recs.map((rec) => (
        <RecommendationCard
          key={rec.id}
          rec={rec}
          isSaved={isSaved(rec.id)}
          onToggleSave={onToggleSave}
          highlighted={highlightedId === rec.id}
        />
      ))}
    </div>
  );
}

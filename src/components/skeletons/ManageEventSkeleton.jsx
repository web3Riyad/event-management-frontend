"use client";

import React from "react";

export default function ManageEventSkeleton({ count = 3 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#181818] rounded-3xl border border-gray-200 dark:border-white/10 p-6 space-y-4 animate-pulse shadow-xs transition-colors"
        >
          {/* Thumbnail preview shimmer */}
          <div className="relative h-44 bg-gray-200 dark:bg-white/10 rounded-2xl w-full overflow-hidden">
            <div className="absolute top-3 left-3 h-5 w-20 bg-gray-300 dark:bg-white/20 rounded-full" />
          </div>

          {/* Title & Date */}
          <div className="h-6 bg-gray-200 dark:bg-white/15 rounded-lg w-4/5" />
          <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-1/2" />

          {/* Location */}
          <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-2/3" />

          {/* Action Buttons: Edit and Delete */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
            <div className="h-9 bg-gray-200 dark:bg-white/15 rounded-xl flex-1" />
            <div className="h-9 bg-gray-200 dark:bg-white/15 rounded-xl flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

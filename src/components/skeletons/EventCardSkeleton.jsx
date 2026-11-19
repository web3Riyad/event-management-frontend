"use client";

import React from "react";

export default function EventCardSkeleton({ count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((index) => (
        <div
          key={index}
          className="group relative flex flex-col justify-between bg-white dark:bg-[#151515] rounded-3xl border border-[#E8E2D5] dark:border-white/10 overflow-hidden shadow-xs animate-pulse transition-colors"
        >
          {/* Thumbnail Skeleton */}
          <div className="relative h-56 w-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            {/* Category Pill Shimmer */}
            <div className="absolute top-4 left-4 h-6 w-24 bg-gray-300 dark:bg-white/20 rounded-full" />
            {/* Date Pill Shimmer */}
            <div className="absolute top-4 right-4 h-6 w-20 bg-gray-300 dark:bg-white/20 rounded-full" />
          </div>

          {/* Card Body Skeleton */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Title shimmer (2 lines) */}
              <div className="h-6 bg-gray-200 dark:bg-white/15 rounded-lg w-4/5 mb-2.5" />
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-3/5 mb-4" />

              {/* Description preview shimmer */}
              <div className="space-y-2 mb-6">
                <div className="h-3.5 bg-gray-100 dark:bg-white/5 rounded w-full" />
                <div className="h-3.5 bg-gray-100 dark:bg-white/5 rounded w-5/6" />
              </div>

              {/* Info Row: Date & Location */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-white/15 shrink-0" />
                  <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded w-1/2" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-white/15 shrink-0" />
                  <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded w-2/3" />
                </div>
              </div>
            </div>

            {/* Action Button Shimmer */}
            <div className="pt-6 mt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/15" />
                <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-16" />
              </div>
              <div className="h-10 w-28 bg-gray-200 dark:bg-white/20 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

"use client";

import React from "react";

export default function EventDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-20 transition-colors animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link Shimmer */}
        <div className="h-5 w-36 bg-gray-200 dark:bg-white/10 rounded-lg mb-8" />

        {/* Hero Banner Skeleton */}
        <div className="relative h-[360px] sm:h-[460px] w-full rounded-3xl bg-gray-200 dark:bg-white/10 overflow-hidden shadow-lg mb-10">
          <div className="absolute top-6 left-6 h-8 w-32 bg-gray-300 dark:bg-white/20 rounded-full" />
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="h-10 sm:h-12 bg-gray-300 dark:bg-white/20 rounded-xl w-3/4" />
            <div className="h-6 bg-gray-300 dark:bg-white/15 rounded-lg w-1/2" />
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="h-20 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 p-4 space-y-2">
                <div className="h-3.5 bg-gray-200 dark:bg-white/15 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-white/20 rounded w-24" />
              </div>
              <div className="h-20 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 p-4 space-y-2">
                <div className="h-3.5 bg-gray-200 dark:bg-white/15 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-white/20 rounded w-24" />
              </div>
              <div className="h-20 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 p-4 space-y-2 col-span-2 sm:col-span-1">
                <div className="h-3.5 bg-gray-200 dark:bg-white/15 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-white/20 rounded w-24" />
              </div>
            </div>

            {/* Description Card Shimmer */}
            <div className="bg-white dark:bg-[#181818] rounded-3xl border border-gray-200 dark:border-white/10 p-8 space-y-4">
              <div className="h-7 bg-gray-200 dark:bg-white/15 rounded-lg w-48 mb-6" />
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-full" />
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-full" />
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-5/6" />
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-4/6" />
            </div>

            {/* Organizer Card Shimmer */}
            <div className="bg-white dark:bg-[#181818] rounded-3xl border border-gray-200 dark:border-white/10 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-white/15 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-white/20 rounded w-40" />
                <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded w-60" />
              </div>
            </div>
          </div>

          {/* Right Column: Action Card Shimmer */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181818] rounded-3xl border border-gray-200 dark:border-white/10 p-6 space-y-6 shadow-sm">
              <div className="h-6 bg-gray-200 dark:bg-white/15 rounded-lg w-32" />
              <div className="h-12 bg-gray-200 dark:bg-white/20 rounded-2xl w-full" />
              <div className="h-12 bg-gray-200 dark:bg-white/20 rounded-2xl w-full" />
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-full" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

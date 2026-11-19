import React from "react";

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Header Shimmer */}
        <div className="text-center space-y-3">
          <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded-full mx-auto" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-white/15 rounded-2xl mx-auto" />
          <div className="h-4 w-80 bg-gray-100 dark:bg-white/10 rounded-lg mx-auto" />
        </div>

        {/* Stats Row Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 p-4" />
          <div className="h-24 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 p-4" />
          <div className="h-24 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 p-4" />
        </div>

        {/* Profile Card Shimmer */}
        <div className="bg-white dark:bg-[#181818] rounded-3xl border border-gray-200 dark:border-white/10 p-8 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-white/15" />
            <div className="space-y-2.5 flex-1">
              <div className="h-6 w-48 bg-gray-200 dark:bg-white/20 rounded-lg" />
              <div className="h-4 w-64 bg-gray-100 dark:bg-white/10 rounded" />
            </div>
          </div>
          <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/10">
            <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-xl w-full" />
            <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-xl w-full" />
            <div className="h-12 bg-gray-200 dark:bg-white/20 rounded-xl w-40" />
          </div>
        </div>
      </div>
    </main>
  );
}

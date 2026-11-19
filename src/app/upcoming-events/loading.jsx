import React from "react";
import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-36 bg-gray-200 dark:bg-white/10 rounded-full mx-auto" />
          <div className="h-10 sm:h-12 w-3/4 bg-gray-200 dark:bg-white/15 rounded-2xl mx-auto" />
          <div className="h-5 w-2/3 bg-gray-100 dark:bg-white/10 rounded-lg mx-auto" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <EventCardSkeleton count={6} />
        </div>
      </div>
    </main>
  );
}

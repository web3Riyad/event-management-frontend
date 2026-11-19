"use client";

import React from "react";
import { Clock, Calendar } from "lucide-react";
import EventCard from "@/components/EventCard";

export default function UpcomingEvents({
  events = [],
  loading = false,
  selectedCategory = "All",
  onResetFilter,
}) {
  return (
    <section id="upcoming" className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0f766e] mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Next on Schedule</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#101010] font-bold tracking-tight">
            Upcoming Events
          </h2>
          <p className="text-sm text-[#777777] mt-1 max-w-xl font-sans">
            Sorted by the nearest coming date first. Past events are strictly excluded from this schedule.
          </p>
        </div>
        <div className="text-xs text-[#777777] bg-white px-3.5 py-1.5 rounded-full border border-[#E8E2D5] shadow-xs self-start sm:self-end">
          Showing <strong className="text-[#101010]">{events.length}</strong> upcoming drives
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse shadow-xs"
            >
              <div className="h-48 bg-gray-200 rounded-xl w-full" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-10 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E2D5]">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-serif text-gray-800">
            No upcoming events found for &quot;{selectedCategory}&quot;
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Check back soon or explore other event categories.
          </p>
          {selectedCategory !== "All" && (
            <button
              type="button"
              onClick={onResetFilter}
              className="mt-4 px-4 py-2 bg-[#0f766e] text-white text-xs font-semibold rounded-xl hover:bg-[#0d9488] transition-all cursor-pointer"
            >
              Show All Categories
            </button>
          )}
        </div>
      ) : (
        /* Grid of Event Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <EventCard key={event._id || index} event={event} isPast={false} />
          ))}
        </div>
      )}
    </section>
  );
}

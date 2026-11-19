"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import EventCard from "@/components/EventCard";

export default function PastEvents({ events = [], selectedCategory = "All" }) {
  return (
    <section id="past" className="space-y-8 pt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>Impact Achieved</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#101010] font-bold tracking-tight">
            Past Events &amp; Completed Drives
          </h2>
          <p className="text-sm text-[#777777] mt-1 max-w-xl font-sans">
            A retrospective of community initiatives and missions successfully executed.
          </p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full border border-gray-200 self-start sm:self-end">
          {events.length} archived drives
        </div>
      </div>

      {/* Grid of Past Event Cards */}
      {events.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
          No concluded past events recorded under &quot;{selectedCategory}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <EventCard key={event._id || index} event={event} isPast={true} />
          ))}
        </div>
      )}
    </section>
  );
}

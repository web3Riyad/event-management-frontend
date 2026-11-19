"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Search,
  PlusCircle,
  Filter,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";
import CategoryFilter, { DEFAULT_CATEGORIES } from "@/components/CategoryFilter";

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all upcoming events (eventDate >= today, sorted ascending)
  useEffect(() => {
    async function fetchUpcoming() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          timeframe: "upcoming",
        });
        if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
          queryParams.set("eventType", selectedCategory);
        }

        const res = await fetch(`/api/events?${queryParams.toString()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcoming();
  }, [selectedCategory]);

  // Client-side search filtering by title, location, or description
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(
      (ev) =>
        ev.eventTitle?.toLowerCase().includes(query) ||
        ev.location?.toLowerCase().includes(query) ||
        ev.eventDescription?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f766e]/10 dark:bg-[#0f766e]/20 border border-[#0f766e]/20 text-[#0f766e] dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>Public Schedule</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight mb-4">
            All Upcoming Community Events
          </h1>

          <p className="text-base sm:text-lg text-[#666666] dark:text-gray-400 font-sans leading-relaxed">
            Discover scheduled volunteer drives, relief distributions, cleanups, and social welfare
            campaigns across your area. Sorted by the nearest coming date first.
          </p>
        </div>

        {/* 1. Category Filter Pills */}
        <div className="mt-10">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            categories={DEFAULT_CATEGORIES}
          />
        </div>

        {/* 2. Search & Controls Bar */}
        <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, locations, or topics..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e] text-sm text-[#101010] dark:text-[#F5F1E8] placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <Link
            href="/events/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white font-semibold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>

        {/* Status Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-8 pt-4 border-t border-[#E8E2D5] dark:border-white/10 text-xs text-[#777777] dark:text-gray-400 text-center sm:text-left">
          <span>
            Showing <strong className="text-[#101010] dark:text-white">{filteredEvents.length}</strong> upcoming drives
            {selectedCategory !== "All" && ` under "${selectedCategory}"`}
          </span>
          {(selectedCategory !== "All" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-[#0f766e] hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EventCardSkeleton count={6} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 max-w-xl mx-auto shadow-xs">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
              No Upcoming Events Found
            </h3>
            <p className="text-sm text-[#666666] dark:text-gray-400 font-sans mb-6">
              {searchQuery
                ? `No upcoming events matched "${searchQuery}". Try adjusting your keywords or clearing the search.`
                : `There are currently no upcoming events under "${selectedCategory}". Check back soon or host your own drive.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(selectedCategory !== "All" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  View All Categories
                </button>
              )}
              <Link
                href="/events/create"
                className="px-5 py-2.5 bg-[#D9A441] hover:bg-[#C59333] text-[#101010] text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Host an Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <EventCard key={event._id || index} event={event} isPast={false} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

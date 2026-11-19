"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Calendar, Sparkles } from "lucide-react";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";

export default function RecentEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentUpcomingEvents() {
      try {
        setLoading(true);
        // Using MongoDB .limit(6) operator via limit=6 parameter
        const res = await fetch("/api/events?timeframe=upcoming&limit=6", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Failed to fetch recent upcoming events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentUpcomingEvents();
  }, []);

  return (
    <section id="upcoming" className="py-24 bg-white dark:bg-[#101010] text-[#101010] dark:text-[#F5F1E8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8E2D5] dark:border-white/10 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f766e]/10 dark:bg-[#0f766e]/20 border border-[#0f766e]/20 text-[#0f766e] dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Next on Schedule</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight">
              Recent Upcoming Events
            </h2>
            <p className="text-sm sm:text-base text-[#666666] dark:text-gray-400 font-sans mt-2 max-w-2xl">
              Showing the next 6 scheduled community service drives, sorted by the coming date first.
              Past events are excluded so your efforts stay focused on real-time community needs.
            </p>
          </div>

          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f766e] hover:bg-[#0d9488] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 self-start md:self-end shrink-0 group cursor-pointer"
          >
            <span>View All Upcoming Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading State with Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EventCardSkeleton count={6} />
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center bg-[#FAF8F5] dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 max-w-xl mx-auto">
            <Calendar className="w-12 h-12 text-[#D9A441] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
              No Upcoming Drives Yet
            </h3>
            <p className="text-sm text-[#666666] dark:text-gray-400 font-sans mb-6">
              Be the first community organizer to publish an upcoming social service drive.
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold text-sm rounded-xl transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Create an Event
            </Link>
          </div>
        ) : (
          /* 3-Column Card Grid (Limited to 6 items) */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, 6).map((event, index) => (
                <EventCard key={event._id || index} event={event} isPast={false} />
              ))}
            </div>

            {/* Bottom CTA to View All Events */}
            <div className="mt-14 text-center">
              <Link
                href="/upcoming-events"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border-2 border-[#101010] dark:border-white/20 hover:border-[#0f766e] dark:hover:border-[#D9A441] text-[#101010] dark:text-[#F5F1E8] hover:text-[#0f766e] dark:hover:text-[#D9A441] hover:bg-[#0f766e]/5 dark:hover:bg-[#D9A441]/10 font-semibold text-sm transition-all duration-300 group cursor-pointer"
              >
                <span>Browse All Upcoming Community Initiatives</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Search,
  ArrowUpDown,
  LogIn,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/jwt-client";
import { formatEventDate } from "@/components/EventCard";
import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";

export default function JoinedEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" (coming earliest first) or "desc"

  const isLoggedIn = Boolean(session?.user);
  const user = session?.user;

  // Direct redirect to login page if user is not authenticated (no middle stage)
  useEffect(() => {
    if (!isPending && !isLoggedIn) {
      window.location.replace("/login?redirect=/events/joined");
    }
  }, [isPending, isLoggedIn]);

  // 1. Fetch all events joined by the logged-in user
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;
    let isMounted = true;

    async function fetchJoinedEvents() {
      try {
        setLoading(true);
        setError("");

        const authHeaders = await getAuthHeaders(user);
        const res = await fetch(
          `/api/events/joined?userEmail=${encodeURIComponent(user.email)}`,
          { headers: authHeaders, cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to load joined events");
        }

        const data = await res.json();
        if (isMounted) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching joined events:", err);
        if (isMounted) {
          setError("Unable to load your joined events. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!isPending && isLoggedIn && user?.email) {
      fetchJoinedEvents();
    }

    return () => {
      isMounted = false;
    };
  }, [isPending, isLoggedIn, user]);

  // 2. Sort by eventDate and search filter
  const processedEvents = useMemo(() => {
    let result = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ev) =>
          ev.eventTitle?.toLowerCase().includes(q) ||
          ev.location?.toLowerCase().includes(q) ||
          ev.eventType?.toLowerCase().includes(q) ||
          ev.eventDescription?.toLowerCase().includes(q)
      );
    }

    // Sort by eventDate
    result.sort((a, b) => {
      const dateA = a.eventDate || "";
      const dateB = b.eventDate || "";
      if (sortDirection === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });

    return result;
  }, [events, searchQuery, sortDirection]);

  // Direct redirect state if unauthenticated or session pending (no middle stage)
  if (isPending || !isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>My Volunteer Schedule</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight mb-4">
            Your Joined Events
          </h1>

          <p className="text-base sm:text-lg text-[#666666] dark:text-gray-400 font-sans leading-relaxed">
            All community initiatives you have registered to join as a volunteer, sorted by event date.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your joined events..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e] text-sm text-[#101010] dark:text-[#F5F1E8] placeholder-gray-400"
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

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-300 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#0f766e] dark:text-[#D9A441]" />
            <span>
              Sort by Date: {sortDirection === "asc" ? "Earliest First" : "Latest First"}
            </span>
          </button>
        </div>

        {/* Counter Bar */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E8E2D5] dark:border-white/10 text-xs text-[#777777] dark:text-gray-400 max-w-4xl mx-auto">
          <span>
            Registered for <strong className="text-[#101010] dark:text-white">{processedEvents.length}</strong> event{processedEvents.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/upcoming-events"
            className="text-[#0f766e] dark:text-[#D9A441] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Explore More Drives</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Grid of Joined Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EventCardSkeleton count={3} />
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white dark:bg-[#181818] rounded-3xl border border-red-200 dark:border-red-900/50 max-w-xl mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-900 dark:text-red-300">{error}</p>
          </div>
        ) : processedEvents.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center bg-white dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 max-w-xl mx-auto shadow-xs">
            <HeartHandshake className="w-14 h-14 text-[#0f766e] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
              No Joined Events Found
            </h3>
            <p className="text-sm text-[#666666] dark:text-gray-400 font-sans mb-8 leading-relaxed">
              {searchQuery
                ? `No joined events matched your search "${searchQuery}".`
                : "You haven't joined any community events yet. Find an upcoming cleanup, tree plantation, or relief drive in your area and join as a volunteer!"}
            </p>
            <Link
              href="/upcoming-events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Upcoming Events</span>
            </Link>
          </div>
        ) : (
          /* Responsive 3-Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedEvents.map((item, idx) => {
              const targetId = item.eventId || item._id;
              const formattedDate = formatEventDate(item.eventDate);
              const isDataUrl = Boolean(item.thumbnailImageUrl?.startsWith("data:"));
              const fallbackImage =
                "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200";

              return (
                <div
                  key={item._id || idx}
                  className="group bg-white dark:bg-[#181818] rounded-2xl border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={item.thumbnailImageUrl || fallbackImage}
                      alt={item.eventTitle || "Joined Event"}
                      fill
                      unoptimized={isDataUrl}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    {/* Event Type Badge */}
                    <span className="absolute top-4 left-4 bg-[#0f766e] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {item.eventType}
                    </span>

                    {/* Confirmed Volunteer Badge */}
                    <span className="absolute top-4 right-4 bg-emerald-800/90 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      Confirmed
                    </span>

                    {/* Event Date on Image */}
                    <span className="absolute bottom-3 left-4 text-xs font-semibold text-white flex items-center gap-1.5 drop-shadow-md">
                      <Calendar className="w-3.5 h-3.5 text-[#D9A441]" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2.5 group-hover:text-[#0f766e] dark:group-hover:text-[#D9A441] transition-colors line-clamp-1">
                      {item.eventTitle}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-gray-400 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 font-sans line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {item.eventDescription}
                    </p>

                    {/* Card Footer */}
                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        You&apos;re a Volunteer
                      </span>

                      <Link
                        href={`/events/${targetId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#101010] dark:bg-[#D9A441] hover:bg-[#0f766e] dark:hover:bg-[#C59333] text-white dark:text-[#101010] text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all duration-300 group/btn cursor-pointer"
                      >
                        <span>View Event</span>
                        <Eye className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

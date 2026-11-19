"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Users,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Share2,
  AlertCircle,
  LogIn,
  Tag,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/jwt-client";
import { formatEventDate } from "@/components/EventCard";
import EventDetailsSkeleton from "@/components/skeletons/EventDetailsSkeleton";

export default function EventDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const { data: session } = useSession();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinSuccessMessage, setJoinSuccessMessage] = useState("");
  const [joinErrorMessage, setJoinErrorMessage] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [joinedCount, setJoinedCount] = useState(0);

  const isLoggedIn = Boolean(session?.user);
  const user = session?.user;

  // 1. Fetch Event Details
  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/events/${eventId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setError("Event not found. It may have been removed or the link is invalid.");
          } else {
            setError("Failed to load event details. Please try again later.");
          }
          return;
        }
        const data = await res.json();
        setEvent(data);
        setJoinedCount(data.joinedCount || 0);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("An unexpected error occurred while loading this event.");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // 2. Check if the currently logged in user has already joined this event
  useEffect(() => {
    async function checkJoinStatus() {
      if (!isLoggedIn || !user?.email || !eventId) return;
      try {
        const res = await fetch(
          `/api/events/${eventId}/join?userEmail=${encodeURIComponent(user.email)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.hasJoined) {
            setHasJoined(true);
          }
        }
      } catch (err) {
        console.error("Error checking join status:", err);
      }
    }

    checkJoinStatus();
  }, [isLoggedIn, user?.email, eventId]);

  // 3. Handle Join Event action
  const handleJoinEvent = async () => {
    // If not logged in -> Redirect immediately to login with no middle stage
    if (!isLoggedIn) {
      window.location.replace(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (hasJoined) return;

    try {
      setIsJoining(true);
      setJoinErrorMessage("");
      setJoinSuccessMessage("");

      const authHeaders = await getAuthHeaders(user, {
        "Content-Type": "application/json",
      });

      const res = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          userId: user.id || null,
          userName: user.name || "Volunteer",
          userEmail: user.email,
        }),
      });

      const result = await res.json();

      if (res.ok || res.status === 201) {
        setHasJoined(true);
        setJoinedCount((prev) => prev + 1);
        setJoinSuccessMessage("You have successfully registered as a volunteer for this event!");
      } else if (res.status === 409 || result.alreadyJoined) {
        setHasJoined(true);
        setJoinSuccessMessage("You have already joined this event.");
      } else {
        setJoinErrorMessage(result.error || "Unable to join event. Please try again.");
      }
    } catch (err) {
      console.error("Error joining event:", err);
      setJoinErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const fallbackImage =
    "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200";

  // Loading State with Skeleton
  if (loading) {
    return <EventDetailsSkeleton />;
  }

  // Error State
  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl border border-[#E8E2D5] shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-[#101010] mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-gray-600 mb-6 font-sans">
            {error || "The event you are looking for does not exist or has been removed."}
          </p>
          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f766e] text-white text-sm font-semibold rounded-xl hover:bg-[#0d9488] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Upcoming Events
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = formatEventDate(event.eventDate);

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-[#0f766e] dark:hover:text-[#D9A441] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Upcoming Events</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 overflow-hidden shadow-xs">
          {/* Main Photo Banner with fill & sizes */}
          <div className="relative h-64 sm:h-80 md:h-[420px] w-full overflow-hidden bg-gray-900">
            <Image
              src={event.thumbnailImageUrl || fallbackImage}
              alt={event.eventTitle || "Event Photo"}
              fill
              priority
              unoptimized={Boolean(event.thumbnailImageUrl?.startsWith("data:"))}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* Event Category Tag */}
            <span className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-[#0f766e] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-lg">
              {event.eventType}
            </span>

            {/* Open For Volunteers Pill */}
            <span className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>Open for Volunteers</span>
            </span>

            {/* Overlay Title & Meta */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight mb-2 sm:mb-3 drop-shadow-md line-clamp-2">
                {event.eventTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D9A441]" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D9A441]" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{event.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D9A441]" />
                  {joinedCount} Registered Volunteer{joinedCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Content & Action Row */}
          <div className="p-5 sm:p-8 md:p-10">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#202020] rounded-2xl border border-gray-200/80 dark:border-white/10 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0f766e]/10 text-[#0f766e]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    Scheduled Date
                  </span>
                  <p className="text-sm font-semibold text-[#101010] dark:text-[#F5F1E8]">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#D9A441]/10 text-[#B8860B]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    Venue / Area
                  </span>
                  <p className="text-sm font-semibold text-[#101010] dark:text-[#F5F1E8] truncate">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    Initiative Type
                  </span>
                  <p className="text-sm font-semibold text-[#101010] dark:text-[#F5F1E8]">{event.eventType}</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-3">
                  About This Initiative
                </h3>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-sans whitespace-pre-line">
                  {event.eventDescription}
                </p>
              </div>

              {/* Volunteer Impact & Guidelines */}
              <div className="p-6 bg-white dark:bg-[#202020] rounded-2xl border border-[#E8E2D5] dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0f766e] dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Volunteer Code of Conduct & Safety</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                  All community members are encouraged to arrive 15 minutes prior to start time.
                  Basic equipment, gloves, drinking water, and field supplies will be provided by
                  the event organizers on site.
                </p>
              </div>

              {/* Success / Error Banners */}
              {joinSuccessMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{joinSuccessMessage}</span>
                </div>
              )}

              {joinErrorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-800 dark:text-red-300 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{joinErrorMessage}</span>
                </div>
              )}

              {/* Login Prompt Box if user clicked while logged out */}
              {showLoginPrompt && !isLoggedIn && (
                <div className="p-6 bg-[#D9A441]/10 border border-[#D9A441]/30 rounded-2xl text-foreground">
                  <div className="flex items-start gap-3">
                    <LogIn className="w-5 h-5 text-[#B8860B] dark:text-[#D9A441] mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#101010] dark:text-[#F5F1E8]">
                        Authentication Required to Join
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 mb-4 font-sans">
                        You can view all event details freely. To register your participation as a
                        volunteer, please sign in or create an account.
                      </p>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/signin?redirect=/events/${eventId}`}
                          className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d9488] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                        >
                          Sign In to Join
                        </Link>
                        <Link
                          href="/signup"
                          className="px-5 py-2 bg-white dark:bg-[#181818] border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-[#F5F1E8] text-xs font-semibold rounded-xl transition-all"
                        >
                          Create Account
                        </Link>
                        <button
                          type="button"
                          onClick={() => setShowLoginPrompt(false)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white ml-auto cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {hasJoined ? (
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      You are confirmed as a volunteer
                    </span>
                  ) : (
                    <span>
                      Free to join • All volunteers welcome • Bring friends & family
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {hasJoined ? (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-default shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Joined This Event</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleJoinEvent}
                      disabled={isJoining}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#0f766e] hover:bg-[#0d9488] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-70"
                    >
                      {isJoining ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <HeartHandshake className="w-4 h-4 text-[#D9A441]" />
                          <span>Join Event</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

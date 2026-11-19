"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, CheckCircle2, Eye, Sparkles } from "lucide-react";
import Image from "next/image";

export function formatEventDate(dateStr) {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-");
    const d = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10));
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EventCard({ event, isPast = false }) {
  const formattedDate = formatEventDate(event.eventDate);
  const fallbackImage =
    "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200";

  const eventId = event._id || "";
  const isDataUrl = Boolean(event.thumbnailImageUrl?.startsWith("data:"));

  // Past event card styling
  if (isPast) {
    return (
      <div className="bg-white/90 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group opacity-90 hover:opacity-100">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            src={event.thumbnailImageUrl || fallbackImage}
            alt={event.eventTitle || "Past Event"}
            fill
            unoptimized={isDataUrl}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full">
            {event.eventType}
          </span>

          <span className="absolute top-3 right-3 bg-emerald-800/90 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Completed
          </span>

          <span className="absolute bottom-2.5 left-3 text-xs text-gray-200 font-medium">
            Concluded {formattedDate}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h4 className="text-base font-serif font-semibold text-gray-900 mb-1.5 line-clamp-1">
            {event.eventTitle}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-2.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-1">
            {event.eventDescription}
          </p>

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <Link
              href={`/events/${eventId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black transition-colors"
            >
              <span>View Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Upcoming event card styling (Coming Date First)
  return (
    <div className="group bg-white dark:bg-[#181818] rounded-2xl border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
      {/* 1. Thumbnail */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={event.thumbnailImageUrl || fallbackImage}
          alt={event.eventTitle || "Event Thumbnail"}
          fill
          unoptimized={isDataUrl}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        {/* 2. Event Type Badge */}
        <span className="absolute top-4 left-4 bg-[#0f766e] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
          {event.eventType}
        </span>

        {/* 3. Event Date */}
        <span className="absolute bottom-3 left-4 text-xs font-semibold text-white flex items-center gap-1.5 drop-shadow-md">
          <Calendar className="w-3.5 h-3.5 text-[#D9A441]" />
          {formattedDate}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* 4. Title */}
        <h3 className="text-xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2.5 group-hover:text-[#0f766e] dark:group-hover:text-[#D9A441] transition-colors line-clamp-1">
          {event.eventTitle}
        </h3>

        {/* 5. Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Event Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 font-sans line-clamp-2 mb-6 flex-1 leading-relaxed">
          {event.eventDescription}
        </p>

        {/* 6. Card Footer with View Event Button */}
        <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-[#0f766e] dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Open for Volunteers</span>
          </span>

          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#101010] dark:bg-[#D9A441] hover:bg-[#0f766e] dark:hover:bg-[#C59333] text-white dark:text-[#101010] text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all duration-300 group/btn cursor-pointer ml-auto"
          >
            <span>View Event</span>
            <Eye className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

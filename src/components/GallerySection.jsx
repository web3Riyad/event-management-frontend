"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, MapPin, Calendar, CheckCircle2, Award, Sparkles } from "lucide-react";
import { formatEventDate } from "@/components/EventCard";

const fallbackImage =
  "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200";

export default function GallerySection() {
  const [galleryEvents, setGalleryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    async function fetchGalleryEvents() {
      try {
        setLoading(true);
        // Query the database via the API for past/concluded community initiatives
        const res = await fetch("/api/events?timeframe=past", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setGalleryEvents(data);
            return;
          }
        }

        // If no past events exist, fetch general real database events
        const fallbackRes = await fetch("/api/events?limit=6", { cache: "no-store" });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setGalleryEvents(Array.isArray(fallbackData) ? fallbackData : []);
        }
      } catch (err) {
        console.error("Failed to fetch gallery events from database:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryEvents();
  }, []);

  return (
    <section id="gallery" className="py-24 bg-[#FAF8F5] dark:bg-[#0A0A0A] text-[#101010] dark:text-[#F5F1E8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9A441]/10 border border-[#D9A441]/30 text-[#B8860B] dark:text-[#D9A441] text-xs font-semibold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>Past History & Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight mb-4">
            Moments of Change: Past Community Action
          </h2>
          <p className="text-base sm:text-lg text-[#666666] dark:text-gray-400 font-sans leading-relaxed">
            A real-time photographic archive celebrating completed volunteer drives, tree plantations,
            relief distributions, and cleanups from our verified community database.
          </p>
        </div>

        {/* Photographic Grid */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#181818] rounded-2xl overflow-hidden border border-[#E8E2D5] dark:border-white/10 shadow-xs animate-pulse flex flex-col"
              >
                <div className="h-64 w-full bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : galleryEvents.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center bg-white dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 max-w-xl mx-auto shadow-xs">
            <Camera className="w-12 h-12 text-[#D9A441] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
              No Past Initiatives Yet
            </h3>
            <p className="text-sm text-[#666666] dark:text-gray-400 font-sans">
              Completed community drives will automatically appear here in the verified photo gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryEvents.map((item, idx) => {
              const formattedDate = formatEventDate(item.eventDate);
              const imageUrl = item.thumbnailImageUrl || fallbackImage;
              const isDataUrl = Boolean(item.thumbnailImageUrl?.startsWith("data:"));
              const impactLabel = item.joinedCount
                ? `${item.joinedCount} Volunteers Joined`
                : `${item.eventType || "Community"} Drive`;

              return (
                <div
                  key={item._id || idx}
                  onClick={() => setSelectedPhoto(item)}
                  className="group bg-white dark:bg-[#181818] rounded-2xl overflow-hidden border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
                >
                  {/* Image Container with Next.js Image fill & sizes */}
                  <div className="relative h-64 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <Image
                      src={imageUrl}
                      alt={item.eventTitle || "Community Event"}
                      fill
                      unoptimized={isDataUrl}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {item.eventType}
                    </span>

                    {/* Impact Highlight Badge */}
                    <div className="absolute top-4 right-4 bg-[#0f766e]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Award className="w-3 h-3 text-[#D9A441]" />
                      <span>{impactLabel}</span>
                    </div>

                    {/* Overlay Title & Date */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                        <Calendar className="w-3 h-3 text-[#D9A441]" />
                        <span>{formattedDate}</span>
                        {item.location && (
                          <>
                            <span className="text-white/40">•</span>
                            <MapPin className="w-3 h-3 text-[#D9A441]" />
                            <span className="truncate">{item.location}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#D9A441] transition-colors leading-snug line-clamp-1">
                        {item.eventTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Description Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-[#181818]">
                    <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 font-sans leading-relaxed line-clamp-2">
                      {item.eventDescription}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Verified Initiative
                      </span>
                      <span className="text-gray-400 group-hover:text-[#101010] dark:group-hover:text-white font-medium transition-colors">
                        View Photo &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Photo Modal Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="bg-white dark:bg-[#181818] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-white/10 text-[#101010] dark:text-[#F5F1E8]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64 sm:h-80 md:h-96 w-full bg-gray-900">
                <Image
                  src={selectedPhoto.thumbnailImageUrl || fallbackImage}
                  alt={selectedPhoto.eventTitle || "Initiative Photo"}
                  fill
                  unoptimized={Boolean(selectedPhoto.thumbnailImageUrl?.startsWith("data:"))}
                  sizes="100vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#0f766e]/10 text-[#0f766e] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    {selectedPhoto.eventType}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#D9A441]/10 text-[#B8860B] dark:text-[#D9A441] text-xs font-bold">
                    {selectedPhoto.joinedCount
                      ? `${selectedPhoto.joinedCount} Volunteers Joined`
                      : `${selectedPhoto.eventType || "Community"} Drive`}
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
                  {selectedPhoto.eventTitle}
                </h3>

                <p className="text-xs text-[#777777] dark:text-gray-400 flex items-center gap-2 mb-4">
                  <Calendar className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>{formatEventDate(selectedPhoto.eventDate)}</span>
                  {selectedPhoto.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-[#D9A441]" />
                      <span>{selectedPhoto.location}</span>
                    </>
                  )}
                </p>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans whitespace-pre-line">
                  {selectedPhoto.eventDescription}
                </p>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

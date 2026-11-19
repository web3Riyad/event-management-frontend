"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, MapPin, Calendar, CheckCircle2, Award, Sparkles } from "lucide-react";


export default function GallerySection() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
            A photographic archive celebrating the hard work, camaraderie, and measurable change
            achieved by our volunteers across past community service initiatives.
          </p>
        </div>

        {/* Photographic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group bg-white dark:bg-[#181818] rounded-2xl overflow-hidden border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Image Container with Next.js Image fill & sizes */}
              <div className="relative h-64 w-full overflow-hidden bg-gray-200">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Category Badge */}
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {item.category}
                </span>

                {/* Impact Highlight Badge */}
                <div className="absolute top-4 right-4 bg-[#0f766e]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Award className="w-3 h-3 text-[#D9A441]" />
                  <span>{item.impact}</span>
                </div>

                {/* Overlay Title & Date */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                    <Calendar className="w-3 h-3 text-[#D9A441]" />
                    <span>{item.date}</span>
                    <span className="text-white/40">•</span>
                    <MapPin className="w-3 h-3 text-[#D9A441]" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#D9A441] transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-[#181818]">
                <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 font-sans leading-relaxed line-clamp-2">
                  {item.description}
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
          ))}
        </div>

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
              <div className="relative h-64 sm:h-80 md:h-96 w-full">
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#0f766e]/10 text-[#0f766e] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    {selectedPhoto.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#D9A441]/10 text-[#B8860B] dark:text-[#D9A441] text-xs font-bold">
                    {selectedPhoto.impact}
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
                  {selectedPhoto.title}
                </h3>

                <p className="text-xs text-[#777777] dark:text-gray-400 flex items-center gap-2 mb-4">
                  <Calendar className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>{selectedPhoto.date}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>{selectedPhoto.location}</span>
                </p>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                  {selectedPhoto.description}
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

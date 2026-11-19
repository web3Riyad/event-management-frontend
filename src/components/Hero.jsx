"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Users, Sparkles, MapPin, ShieldCheck } from "lucide-react";

export default function HeroPart() {
  return (
    <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#101010] text-[#F5F1E8]">
      {/* Background Photography with Warm Social Service Theme */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bannar-background.jpg"
          alt="Community Service and Volunteerism Drive"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 brightness-105 contrast-105 scale-100"
        />
        {/* Subtle, soft overlays for text readability while preserving image brightness */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D9A441]/15 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 sm:pt-32 pb-16 sm:pb-20">
        {/* Category Pill Tagline */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D9A441]/40 bg-black/50 backdrop-blur-md mb-6 sm:mb-8 shadow-lg max-w-full">
          <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441] shrink-0" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#D9A441] font-semibold truncate">
            Social Development & Community Welfare
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.15] sm:leading-[1.1] mb-6 drop-shadow-lg">
          Empowering Communities, <br className="hidden sm:inline" />
          <span className="italic font-light text-[#D9A441]">Transforming Lives Together</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#F5F1E8]/90 leading-relaxed font-sans mb-8 sm:mb-10 drop-shadow-md px-2">
          Join passionate citizens, grassroots volunteers, and community leaders organizing 
          environmental cleanups, winter relief drives, tree plantations, and aid campaigns 
          to build resilient, compassionate neighborhoods.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href="/upcoming-events"
            className="w-full sm:w-auto bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold px-6 sm:px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
          >
            <span>Explore Upcoming Drives</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto border border-[#F5F1E8]/30 hover:border-[#D9A441] bg-white/5 hover:bg-white/10 text-[#F5F1E8] font-medium px-6 sm:px-8 py-3.5 rounded-xl backdrop-blur-sm transition-all duration-300 text-sm sm:text-base text-center"
          >
            Platform Features
          </Link>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col items-center p-3 sm:p-4 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#D9A441]">12,500+</span>
            <span className="text-[11px] sm:text-xs text-[#E8E2D5]/70 font-sans mt-0.5 text-center">Active Volunteers</span>
          </div>
          <div className="flex flex-col items-center p-3 sm:p-4 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#D9A441]">380+</span>
            <span className="text-[11px] sm:text-xs text-[#E8E2D5]/70 font-sans mt-0.5 text-center">Community Drives</span>
          </div>
          <div className="flex flex-col items-center p-3 sm:p-4 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#D9A441]">28+</span>
            <span className="text-[11px] sm:text-xs text-[#E8E2D5]/70 font-sans mt-0.5 text-center">Districts Reached</span>
          </div>
          <div className="flex flex-col items-center p-3 sm:p-4 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-xs">
            <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#D9A441]">100%</span>
            <span className="text-[11px] sm:text-xs text-[#E8E2D5]/70 font-sans mt-0.5 text-center">Grassroots Impact</span>
          </div>
        </div>
      </div>
    </section>
  );
}

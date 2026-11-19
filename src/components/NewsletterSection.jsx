"use client";

import React, { useState } from "react";
import { Mail, Send, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <section className="py-20 bg-[#101010] text-[#F5F1E8] relative overflow-hidden border-t border-[#222222]">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0f766e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D9A441] text-xs font-semibold uppercase tracking-wider mb-6">
          <Mail className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>Community Bulletin</span>
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          Stay Connected With Community Action
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#E8E2D5]/80 font-sans leading-relaxed mb-10">
          Subscribe to our community newsletter to receive monthly grassroots impact reports,
          announcements of newly scheduled drives, and inspiring stories of positive change.
        </p>

        {/* Form Container */}
        <div className="max-w-xl mx-auto">
          {isSubscribed ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3 text-emerald-300 text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Thank you for subscribing! You will receive our next community update.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-5 h-5 text-[#777777] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full pl-12 pr-4 py-3.5 bg-[#181818] border border-[#2E2E2E] focus:border-[#D9A441] text-white placeholder-[#777777] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 transition-all"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-6 text-xs text-[#777777]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0f766e]" />
              Zero spam, unsubscribe anytime
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#D9A441]" />
              100% grassroots driven
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

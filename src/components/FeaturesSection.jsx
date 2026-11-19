"use client";

import React from "react";
import {
  Users,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  TreePine,
  HeartHandshake,
  ArrowUpRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Grassroots Volunteer Mobilization",
    description:
      "Connect directly with passionate volunteers in your area. Join local tree plantations, river cleanups, food distribution, and medical aid camps with simple one-click participation.",
    tag: "Community Power",
    color: "text-[#0f766e] bg-[#0f766e]/10 border-[#0f766e]/20",
  },
  {
    icon: CalendarCheck,
    title: "Smart Chronological Scheduling",
    description:
      "All community initiatives are automatically arranged by the nearest upcoming date first. Past events are archived cleanly, ensuring active drives receive maximum volunteer focus.",
    tag: "Real-time Tracking",
    color: "text-[#D9A441] bg-[#D9A441]/10 border-[#D9A441]/20",
  },
  {
    icon: HeartHandshake,
    title: "Direct Organizer Tools",
    description:
      "Create, publish, and manage social development drives in minutes. Provide exact venue details, categories, descriptions, and media to rally community support efficiently.",
    tag: "Event Management",
    color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Social Impact",
    description:
      "Every completed campaign is recorded in our public gallery archive, providing donors, volunteers, and the community full transparency and celebrated results.",
    tag: "Verified Transparency",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#FAF8F5] dark:bg-[#0D0D0D] text-[#101010] dark:text-[#F5F1E8] border-b border-[#E8E2D5] dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f766e]/10 dark:bg-[#0f766e]/20 border border-[#0f766e]/20 text-[#0f766e] dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Application Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight mb-4">
            Built for Grassroots Action & Social Change
          </h2>
          <p className="text-base sm:text-lg text-[#666666] dark:text-gray-400 font-sans leading-relaxed">
            Our platform equips civic leaders, non-profits, and caring citizens with purpose-built
            tools to coordinate, launch, and measure impactful community service.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="group bg-white dark:bg-[#181818] rounded-2xl p-7 border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-xl border ${feature.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-300">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-3 group-hover:text-[#0f766e] dark:group-hover:text-[#D9A441] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#666666] dark:text-gray-400 font-sans leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center text-xs font-semibold text-[#0f766e] dark:text-[#D9A441] group-hover:translate-x-1 transition-transform">
                  <span>Explore Feature</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

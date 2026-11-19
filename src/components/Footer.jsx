"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HeartHandshake,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0c0c0c] text-[#F5F1E8] border-t border-[#222222] pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Brand & Mission Statement */}
        <div className="sm:col-span-2 space-y-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden p-1 bg-[#181818] border border-[#D9A441]/40 shadow-md">
              <Image
                src="/logo.png"
                alt="UNIQUE Events Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tight text-[#D9A441]">
                UNIQUE<span className="text-[#0f766e]">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#777777] font-sans font-medium">
                Community Event Management
              </span>
            </div>
          </Link>

          <p className="text-sm text-[#888888] max-w-md leading-relaxed font-sans">
            Empowering communities and transforming lives through grassroots volunteerism,
            environmental cleanups, tree plantations, winter relief drives, and social welfare
            initiatives across our cities.
          </p>

          <div className="flex items-center gap-4 pt-2 text-xs text-[#0f766e]">
            <span className="flex items-center gap-1.5 font-semibold">
              <HeartHandshake className="w-4 h-4 text-[#D9A441]" />
              100% Grassroots Driven
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#0f766e]" />
              Verified Community Action
            </span>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#D9A441] font-semibold mb-4">
            Platform Navigation
          </h4>
          <ul className="space-y-2.5 text-sm text-[#F5F1E8]/80 font-sans">
            <li>
              <Link href="/upcoming-events" className="hover:text-[#D9A441] transition-colors flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
                Upcoming Events
              </Link>
            </li>
            <li>
              <Link href="/#features" className="hover:text-[#D9A441] transition-colors">
                Platform Capabilities
              </Link>
            </li>
            <li>
              <Link href="/#gallery" className="hover:text-[#D9A441] transition-colors">
                Past History & Gallery
              </Link>
            </li>
            <li>
              <Link href="/events/create" className="hover:text-[#D9A441] transition-colors">
                Create a Drive
              </Link>
            </li>
            <li>
              <Link href="/events/joined" className="hover:text-[#D9A441] transition-colors">
                Joined Events
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Community Inquiries */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#D9A441] font-semibold mb-4">
            Community Desk
          </h4>
          <p className="text-sm text-[#888888] mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0f766e] shrink-0" />
            community@unique-events.org
          </p>
          <p className="text-sm text-[#888888] mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D9A441] shrink-0" />
            Dhaka, Bangladesh
          </p>
          <p className="text-xs text-[#666666] mt-4 leading-relaxed font-sans">
            Have questions about organizing an initiative in your local neighborhood? Reach out to our volunteer support team.
          </p>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-4 text-center sm:text-left">
        <p>© 2026 UNIQUE Event Management. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-end">
          <Link href="/upcoming-events" className="hover:text-[#F5F1E8] transition-colors">
            Upcoming Drives
          </Link>
          <Link href="/login" className="hover:text-[#F5F1E8] transition-colors">
            Volunteer Sign In
          </Link>
          <Link href="/register" className="hover:text-[#F5F1E8] transition-colors">
            Register Account
          </Link>
        </div>
      </div>
    </footer>
  );
}

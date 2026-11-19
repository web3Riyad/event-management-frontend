"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Calendar,
  PlusCircle,
  Settings,
  CheckCircle2,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  Menu,
  Sparkles,
  User,
} from "lucide-react";

import { cn } from "cn";

// Real Auth Client hooks
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";

// Shadcn UI Components
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = Boolean(session?.user);
  const user = session?.user;

  const displayName = user?.name || "Member";
  const email = user?.email || "";
  const avatarUrl =
    user?.image ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Scroll listener for adaptive header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const isHeroTransparent = pathname === "/" && !isScrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 -mb-20 transition-all duration-300",
        isHeroTransparent
          ? "bg-transparent text-[#F5F1E8] border-b border-white/10 backdrop-blur-sm"
          : "bg-white/95 dark:bg-[#101010]/95 text-gray-900 dark:text-[#F5F1E8] border-b border-gray-200 dark:border-white/10 shadow-xs backdrop-blur-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* 1. App Logo and Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full overflow-hidden p-1 bg-[#181818] border border-[#D9A441]/40 group-hover:border-[#D9A441] transition-all duration-300 shadow-md">
            <Image
              src="/logo.png"
              alt="UNIQUE Events Logo"
              width={44}
              height={44}
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#D9A441] group-hover:text-black dark:group-hover:text-[#F5F1E8] transition-colors leading-none">
              UNIQUE<span className="text-[#D9A441]">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#777777] dark:text-[#888888] font-sans font-medium mt-1">
              Event Management
            </span>
          </div>
        </Link>

        {/* 2. Navigation: Upcoming Events */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/upcoming-events"
            className={cn(
              "flex items-center gap-2 text-sm font-medium tracking-wide transition-all duration-200 py-2 border-b-2 border-transparent hover:border-[#D9A441]",
              isHeroTransparent
                ? "text-[#F5F1E8]/90 hover:text-[#D9A441]"
                : "text-gray-700 dark:text-[#F5F1E8]/90 hover:text-[#D9A441] dark:hover:text-[#D9A441]"
            )}
          >
            <Calendar className="w-4 h-4 text-[#D9A441]" />
            Upcoming Events
          </Link>
        </nav>

        {/* 3. Conditional Login/Logout (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {!isLoggedIn ? (
            /* If not logged in -> Show Login and Register buttons */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer",
                  isHeroTransparent
                    ? "text-[#F5F1E8] hover:text-[#D9A441] hover:bg-white/5"
                    : "text-gray-700 dark:text-[#F5F1E8] hover:text-[#D9A441] dark:hover:text-[#D9A441] hover:bg-gray-100 dark:hover:bg-white/5"
                )}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Login
              </Link>

              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                )}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Register
              </Link>
            </div>
          ) : (
            /* If logged in -> Show Profile Avatar Dropdown (with hover display name) + Navbar Logout button */
            <div className="flex items-center gap-4">
              
              {/* Profile Avatar Trigger & Dropdown Menu */}
              <div className="relative group/avatar" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  title={displayName}
                  className={cn(
                    "flex items-center gap-2 p-1 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-[#D9A441]/60 cursor-pointer",
                    isHeroTransparent
                      ? "bg-black/40 hover:bg-black/60 border-[#D9A441]/50 hover:border-[#D9A441]"
                      : "bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 border-gray-300 dark:border-[#D9A441]/50 hover:border-[#D9A441]"
                  )}
                  aria-label={displayName}
                  aria-expanded={isDropdownOpen}
                >
                  <Avatar className="size-9 ring-2 ring-[#D9A441]/40">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-[#181818] text-[#D9A441] font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#D9A441] transition-transform duration-200 pr-0.5 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Hover Display Name Tooltip */}
                {!isDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black/95 text-white text-xs font-medium rounded-lg shadow-xl pointer-events-none opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-40 border border-white/10">
                    {displayName}
                  </div>
                )}

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#181818] text-gray-800 dark:text-[#F5F1E8] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Header: User Name & Email */}
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 font-sans truncate mt-0.5">
                        {email}
                      </p>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1.5 space-y-0.5">
                      {/* 0. My Profile (Gold User) */}
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#D9A441] dark:hover:text-[#D9A441] hover:bg-amber-50/60 dark:hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#D9A441] shrink-0" />
                        <span>My Profile</span>
                      </Link>

                      {/* 1. Create Event (Teal PlusCircle) */}
                      <Link
                        href="/events/create"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50/60 dark:hover:bg-teal-950/30 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>Create Event</span>
                      </Link>

                      {/* 2. Manage Events (Purple Settings) */}
                      <Link
                        href="/events/manage"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>Manage Events</span>
                      </Link>

                      {/* 3. Joined Events (Green CheckCircle2) */}
                      <Link
                        href="/events/joined"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Joined Events</span>
                      </Link>
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-gray-100 dark:border-white/10 my-1" />

                    {/* 4. Logout (Red LogOut) */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dedicated Navbar Logout Button */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300/60 dark:border-gray-300/40 hover:border-red-400 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-sm font-medium px-4 py-2 transition-all cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>

        {/* 4. Mobile Menu Navigation (using Shadcn Sheet) */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <ThemeToggle />

          {isLoggedIn && (
            <Avatar className="size-8 ring-1 ring-[#D9A441]">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-[#181818] text-[#D9A441] text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isHeroTransparent
                      ? "text-[#F5F1E8] hover:text-[#D9A441] hover:bg-[#181818]"
                      : "text-gray-800 dark:text-[#F5F1E8] hover:text-[#D9A441] hover:bg-gray-100 dark:hover:bg-[#181818]"
                  )}
                />
              }
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-white dark:bg-[#141414] text-gray-900 dark:text-[#F5F1E8] border-l border-gray-200 dark:border-[#262626] p-6 w-80 max-w-full"
            >
              <SheetHeader className="p-0 mb-6">
                <SheetTitle className="text-left font-serif text-xl text-[#D9A441]">
                  UNIQUE<span className="text-[#101010] dark:text-[#F5F1E8]">.</span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                <Link
                  href="/upcoming-events"
                  onClick={() => setIsMobileSheetOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-[#F5F1E8] hover:text-[#D9A441] py-2 border-b border-gray-100 dark:border-[#222222]"
                >
                  <Calendar className="w-4 h-4 text-[#D9A441]" />
                  Upcoming Events
                </Link>

                {isLoggedIn ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-[#2A2A2A]">
                      <Avatar className="size-10 ring-2 ring-[#D9A441]">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-[#101010] text-[#D9A441] font-semibold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-serif font-medium text-gray-900 dark:text-white truncate">
                          {displayName}
                        </span>
                        <span className="text-xs text-[#777777] font-sans truncate">
                          {email}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileSheetOpen(false)}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#F5F1E8] hover:text-[#D9A441] py-2 px-1 rounded-lg"
                      >
                        <User className="w-4 h-4 text-[#D9A441]" />
                        My Profile
                      </Link>
                      <Link
                        href="/events/create"
                        onClick={() => setIsMobileSheetOpen(false)}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#F5F1E8] hover:text-teal-600 dark:hover:text-teal-400 py-2 px-1 rounded-lg"
                      >
                        <PlusCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Create Event
                      </Link>
                      <Link
                        href="/events/manage"
                        onClick={() => setIsMobileSheetOpen(false)}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#F5F1E8] hover:text-purple-600 dark:hover:text-purple-400 py-2 px-1 rounded-lg"
                      >
                        <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Manage Events
                      </Link>
                      <Link
                        href="/events/joined"
                        onClick={() => setIsMobileSheetOpen(false)}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#F5F1E8] hover:text-emerald-600 dark:hover:text-emerald-400 py-2 px-1 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Joined Events
                      </Link>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileSheetOpen(false);
                      }}
                      className="w-full mt-4 border-red-500/30 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl py-2.5 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileSheetOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full border-gray-300 dark:border-[#777777]/40 text-gray-800 dark:text-[#F5F1E8] hover:text-[#D9A441] hover:border-[#D9A441] py-2.5 rounded-xl cursor-pointer flex items-center justify-center"
                      )}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileSheetOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "w-full bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center"
                      )}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}

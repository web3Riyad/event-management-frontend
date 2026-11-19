"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  Trash2,
  Save,
  ArrowRight,
  Settings,
  HeartHandshake,
  Layers,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/jwt-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isLoggedIn = Boolean(user);

  const fileInputRef = useRef(null);

  // Profile Form State (Using state override pattern to prevent cascading render effects)
  const [customName, setCustomName] = useState(null);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [imageInputMode, setImageInputMode] = useState("file"); // "file" or "url"

  const name = customName !== null ? customName : (user?.name || "");
  const avatarPreview = customPhoto !== null ? customPhoto : (user?.image || "");
  const photoURL = avatarPreview;

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Activity Stats State
  const [stats, setStats] = useState({
    createdEventsCount: 0,
    joinedEventsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // 1. Authentication Protection: Redirect immediately if unauthenticated
  useEffect(() => {
    if (!isPending && !isLoggedIn) {
      router.replace("/login?redirect=/profile");
    }
  }, [isPending, isLoggedIn, router]);

  // 2. Fetch user stats from API
  useEffect(() => {
    async function fetchProfileStats() {
      if (!user?.email) return;

      try {
        setStatsLoading(true);
        const authHeaders = await getAuthHeaders(user);
        const res = await fetch("/api/user/profile", {
          headers: authHeaders,
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Error fetching profile stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    if (isLoggedIn) {
      fetchProfileStats();
    }
  }, [isLoggedIn, user]);

  // Handle image file selection from user device
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image file exceeds 8MB. Please select a smaller photo.");
      return;
    }

    setErrorMessage("");
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCustomPhoto(dataUrl);
        setAvatarFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        if (fieldErrors.photo) {
          setFieldErrors((prev) => ({ ...prev, photo: "" }));
        }
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCustomPhoto("");
    setAvatarFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Full Name is required.";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Profile Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setErrorMessage("Please resolve the highlighted errors.");
      return;
    }

    const trimmedName = name.trim();
    const finalPhoto = avatarPreview || photoURL.trim() || "";

    try {
      setIsSaving(true);

      // 1. Call BetterAuth updateUser client method
      try {
        if (authClient?.updateUser) {
          await authClient.updateUser({
            name: trimmedName,
            image: finalPhoto,
          });
        }
      } catch (clientErr) {
        console.warn("BetterAuth client updateUser notice:", clientErr);
      }

      // 2. Call internal /api/user/profile to sync MongoDB directly
      const authHeaders = await getAuthHeaders(user, {
        "Content-Type": "application/json",
      });

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: trimmedName,
          image: finalPhoto,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || "Failed to update profile. Please try again.");
        setIsSaving(false);
        return;
      }

      setSuccessMessage("Profile updated successfully!");

      // Refresh page data so Navbar displays the updated user profile
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage(err?.message || "An unexpected error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Unauthenticated or pending session: return null to avoid flashing
  if (isPending || !isLoggedIn) {
    return null;
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9A441]/10 border border-[#D9A441]/30 text-[#D9A441] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Member Account</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight">
            User Profile
          </h1>
          <p className="text-sm sm:text-base text-[#666666] dark:text-gray-400 font-sans mt-2">
            View your volunteer impact statistics and update your personal credentials.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Top Activity Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {/* Card 1: Events Created */}
          <Link
            href="/events/manage"
            className="group p-6 bg-white dark:bg-[#151515] rounded-3xl border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:border-[#D9A441] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-gray-400">
                Created Drives
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#101010] dark:text-white">
                {statsLoading ? "—" : stats.createdEventsCount}
              </span>
              <span className="text-xs text-[#0f766e] dark:text-[#D9A441] font-medium flex items-center gap-1 group-hover:underline">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Card 2: Events Joined */}
          <Link
            href="/events/joined"
            className="group p-6 bg-white dark:bg-[#151515] rounded-3xl border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:border-[#D9A441] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-gray-400">
                Joined Drives
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#101010] dark:text-white">
                {statsLoading ? "—" : stats.joinedEventsCount}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 group-hover:underline">
                View Schedule <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Card 3: Volunteer Status */}
          <div className="p-6 bg-white dark:bg-[#151515] rounded-3xl border border-[#E8E2D5] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-gray-400">
                Community Status
              </span>
              <div className="p-2.5 rounded-xl bg-[#D9A441]/10 text-[#D9A441]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-serif font-bold text-[#D9A441]">
                {stats.createdEventsCount > 0
                  ? "Event Organizer"
                  : stats.joinedEventsCount > 0
                  ? "Active Volunteer"
                  : "Verified Member"}
              </span>
              <span className="text-[11px] text-emerald-500 font-medium">● Active</span>
            </div>
          </div>
        </div>

        {/* Main Profile Grid: View Card (Left) & Edit Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card (View) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#151515] rounded-3xl border border-[#E8E2D5] dark:border-white/10 p-8 shadow-xs flex flex-col items-center text-center">
            {/* Avatar Display */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#D9A441] shadow-xl bg-black mb-6">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt={user?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#181818] text-[#D9A441] font-serif font-bold text-3xl">
                  {initials}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#101010] dark:text-white">
              {name || user?.name || "Member"}
            </h2>
            <p className="text-xs text-[#777777] dark:text-gray-400 font-sans mt-1">
              {user?.email}
            </p>

            <div className="w-full pt-6 mt-6 border-t border-gray-100 dark:border-white/10 space-y-3 text-left text-xs">
              <div className="flex items-center justify-between text-[#666666] dark:text-gray-400">
                <span>Account Role</span>
                <span className="font-semibold text-[#101010] dark:text-white">
                  Social Volunteer
                </span>
              </div>
              <div className="flex items-center justify-between text-[#666666] dark:text-gray-400">
                <span>Email Verified</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-[#666666] dark:text-gray-400">
                <span>Total Initiatives</span>
                <span className="font-semibold text-[#101010] dark:text-white">
                  {stats.createdEventsCount + stats.joinedEventsCount} events
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form (Update) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#151515] rounded-3xl border border-[#E8E2D5] dark:border-white/10 p-8 sm:p-10 shadow-xs">
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-xl font-serif font-bold text-[#101010] dark:text-white">
                Update Profile Credentials
              </h3>
              <p className="text-xs text-[#666666] dark:text-gray-400 font-sans mt-1">
                Modify your public display name and upload a profile photograph.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Field 1: Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    placeholder="Your Full Name"
                    className={`w-full pl-11 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#1c1c1c] rounded-xl border text-sm text-[#101010] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 transition-all ${
                      fieldErrors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-white/10 focus:border-[#D9A441]"
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Email Address (Read-only) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
                    Email Address
                  </label>
                  <span className="text-[11px] text-[#777777] dark:text-gray-400 font-sans">
                    Linked to authentication
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Field 3: Profile Picture Selector (Device Upload or URL) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
                    Update Profile Picture
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("file")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        imageInputMode === "file"
                          ? "text-[#D9A441] font-bold underline"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      From Device
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        imageInputMode === "url"
                          ? "text-[#D9A441] font-bold underline"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === "file" ? (
                  /* Device Upload Mode */
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="profile-device-upload"
                    />

                    {!avatarFileName ? (
                      <label
                        htmlFor="profile-device-upload"
                        className="flex items-center gap-4 p-4 bg-[#FAF8F5] dark:bg-[#1c1c1c] border border-dashed border-gray-300 dark:border-white/10 hover:border-[#D9A441] rounded-2xl cursor-pointer group transition-all"
                      >
                        <div className="p-3 rounded-xl bg-black/10 dark:bg-black/60 text-[#D9A441] group-hover:scale-105 transition-transform">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#101010] dark:text-white group-hover:text-[#D9A441] transition-colors">
                            Choose a photo from your computer
                          </span>
                          <span className="text-[11px] text-[#777777] dark:text-gray-400">
                            PNG, JPG, WEBP (Max 8MB, auto-optimized)
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] dark:bg-[#1c1c1c] border border-[#D9A441]/40 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#D9A441] bg-black shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatarPreview}
                              alt="Avatar Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col truncate max-w-[220px]">
                            <span className="text-xs font-semibold text-[#101010] dark:text-white truncate">
                              {avatarFileName}
                            </span>
                            <span className="text-[11px] text-emerald-500 font-medium">
                              Ready to save
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Input Mode */
                  <div className="relative flex items-center">
                    <Camera className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="url"
                      value={photoURL}
                      onChange={(e) => {
                        setCustomPhoto(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-white/10 text-sm text-[#101010] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 focus:border-[#D9A441] transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/"
                  className="text-xs text-[#777777] hover:text-[#101010] dark:hover:text-white font-medium hover:underline transition-colors py-2"
                >
                  Return to Home
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

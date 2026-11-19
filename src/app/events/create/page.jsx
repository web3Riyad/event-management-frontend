"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Tag,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UploadCloud,
  FileImage,
  Trash2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/jwt-client";

const CATEGORIES = [
  "Donation",
  "Cleanup",
  "Plantation",
  "Winter Relief",
  "Food Drive",
  "Health Camp",
  "Education",
];

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { data: session, isPending } = useSession();

  const [formData, setFormData] = useState({
    eventTitle: "",
    eventType: "Cleanup",
    eventDate: "",
    location: "",
    thumbnailImageUrl: "",
    eventDescription: "",
  });

  const [imageFileInfo, setImageFileInfo] = useState(null); // { name, size }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isLoggedIn = Boolean(session?.user);
  const user = session?.user;

  // Direct redirect to login page if user is not authenticated (no middle stage)
  useEffect(() => {
    if (!isPending && !isLoggedIn) {
      window.location.replace("/login?redirect=/events/create");
    }
  }, [isPending, isLoggedIn]);

  // Minimum date selectable is tomorrow per requirement (future dates only)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  const validateField = (name, value) => {
    let err = "";
    if (name === "eventTitle") {
      if (!value.trim()) err = "Event Title is required.";
      else if (value.trim().length < 5) err = "Title must be at least 5 characters.";
    } else if (name === "eventType") {
      if (!value.trim()) err = "Please choose an event type.";
    } else if (name === "eventDate") {
      if (!value) err = "Event Date is required.";
      else if (value <= todayStr) err = "Event date must be strictly in the future (after today).";
    } else if (name === "location") {
      if (!value.trim()) err = "Location is required.";
      else if (value.trim().length < 3) err = "Location must be at least 3 characters.";
    } else if (name === "eventDescription") {
      if (!value.trim()) err = "Event Description is required.";
      else if (value.trim().length < 20) err = "Description must be at least 20 characters.";
    }
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
    return err;
  };

  const validateAll = () => {
    const errors = {};
    if (!formData.eventTitle.trim()) {
      errors.eventTitle = "Event Title is required.";
    } else if (formData.eventTitle.trim().length < 5) {
      errors.eventTitle = "Title must be at least 5 characters.";
    }

    if (!formData.eventType.trim()) {
      errors.eventType = "Please select an event category.";
    }

    if (!formData.eventDate) {
      errors.eventDate = "Event Date is required.";
    } else if (formData.eventDate <= todayStr) {
      errors.eventDate = "Event date must be strictly in the future (no past or today).";
    }

    if (!formData.location.trim()) {
      errors.location = "Location / Venue is required.";
    } else if (formData.location.trim().length < 3) {
      errors.location = "Location must be at least 3 characters.";
    }

    if (!formData.thumbnailImageUrl) {
      errors.thumbnailImageUrl = "Please choose an event thumbnail photo from your device.";
    }

    if (!formData.eventDescription.trim()) {
      errors.eventDescription = "Event Description is required.";
    } else if (formData.eventDescription.trim().length < 20) {
      errors.eventDescription = "Description must be at least 20 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Convert uploaded image file into a web-optimized data URL
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    // Limit original file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size exceeds 10MB. Please choose a smaller photo.");
      return;
    }

    setError("");
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Client-side canvas resize for optimal performance
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1200;

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

        const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

        setFormData((prev) => ({
          ...prev,
          thumbnailImageUrl: optimizedDataUrl,
        }));

        setImageFileInfo({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, thumbnailImageUrl: "" }));
    setImageFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoggedIn) {
      setError("You must be logged in to create and publish a community event.");
      return;
    }

    if (!validateAll()) {
      setError("Please fix the errors indicated in the form before submitting.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        eventTitle: formData.eventTitle.trim(),
        eventType: formData.eventType.trim(),
        eventDate: formData.eventDate,
        location: formData.location.trim(),
        thumbnailImageUrl: formData.thumbnailImageUrl,
        eventDescription: formData.eventDescription.trim(),
        creatorEmail: user?.email || null,
        creatorName: user?.name || null,
        creatorId: user?.id || null,
      };

      const authHeaders = await getAuthHeaders(user, {
        "Content-Type": "application/json",
      });

      const res = await fetch("/api/events", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      setSuccess(true);

      // Show success message and redirect to Upcoming Events page per requirement
      setTimeout(() => {
        router.push("/upcoming-events");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message || "An unexpected error occurred while creating the event.");
    } finally {
      setLoading(false);
    }
  };

  // Direct redirect state if unauthenticated or session pending (no middle stage)
  if (isPending || !isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-[#0f766e] dark:hover:text-[#D9A441] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upcoming Events</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-10 border-b border-gray-100 dark:border-white/10 bg-gradient-to-br from-white via-white to-[#FAF8F5] dark:from-[#181818] dark:via-[#181818] dark:to-[#121212]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f766e]/10 dark:bg-[#0f766e]/20 text-[#0f766e] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community Organizer Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight">
              Create a Community Drive
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mt-2 max-w-2xl leading-relaxed">
              Publish an environmental cleanup, food distribution, tree plantation, or relief drive.
              Your initiative will be featured on the public Upcoming Events calendar.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8" noValidate>
            {/* Success Banner */}
            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-medium animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Event created successfully! Redirecting you to the upcoming events page...</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-800 dark:text-red-300 text-sm font-medium">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Field 1: Event Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventTitle"
                value={formData.eventTitle}
                onChange={handleChange}
                placeholder="e.g. Clean Dhaka Community Drive"
                className={`w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e] transition-all ${
                  fieldErrors.eventTitle ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-white/10"
                }`}
              />
              {fieldErrors.eventTitle && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.eventTitle}</span>
                </p>
              )}
            </div>

            {/* Field 2 & 3: Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Event Type / Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#0f766e] transition-all appearance-none cursor-pointer ${
                      fieldErrors.eventType ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-white/10"
                    }`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="dark:bg-[#202020] dark:text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Tag className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {fieldErrors.eventType && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.eventType}</span>
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="eventDate"
                    min={tomorrowStr}
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#0f766e] transition-all cursor-pointer ${
                      fieldErrors.eventDate ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-white/10"
                    }`}
                  />
                </div>
                {fieldErrors.eventDate ? (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.eventDate}</span>
                  </p>
                ) : (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">
                    Must be scheduled strictly in the future (tomorrow or later).
                  </span>
                )}
              </div>
            </div>

            {/* Field 4: Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Location / Venue <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhanmondi Lake, Dhaka"
                  className={`w-full pl-11 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e] transition-all ${
                    fieldErrors.location ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-white/10"
                  }`}
                />
                <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {fieldErrors.location && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.location}</span>
                </p>
              )}
            </div>

            {/* Field 5: Thumbnail Image chosen from file */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Event Thumbnail Image <span className="text-red-500">*</span>
              </label>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageFileChange}
                className="hidden"
                id="event-image-upload"
              />

              {!formData.thumbnailImageUrl ? (
                /* Empty Upload Dropzone */
                <label
                  htmlFor="event-image-upload"
                  className={`flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-2xl bg-[#FAF8F5] dark:bg-[#202020] hover:bg-white dark:hover:bg-[#252525] transition-all cursor-pointer group ${
                    fieldErrors.thumbnailImageUrl
                      ? "border-red-500"
                      : "border-gray-300 dark:border-white/10 hover:border-[#0f766e]"
                  }`}
                >
                  <div className="p-4 rounded-full bg-white dark:bg-[#282828] shadow-xs group-hover:scale-110 transition-transform mb-3 text-[#0f766e]">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-[#101010] dark:text-[#F5F1E8] group-hover:text-[#0f766e] transition-colors">
                    Click to choose an image from your device
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supports PNG, JPG, JPEG, or WEBP (Max 10MB)
                  </span>
                </label>
              ) : (
                /* File Chosen & Live Preview Box */
                <div className="space-y-3">
                  <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-900 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.thumbnailImageUrl}
                      alt="Chosen Event Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 truncate">
                        <FileImage className="w-4 h-4 text-[#D9A441] shrink-0" />
                        <span className="text-xs font-semibold truncate">
                          {imageFileInfo?.name || "Uploaded Photo"}
                        </span>
                        {imageFileInfo?.size && (
                          <span className="text-[11px] text-gray-300">
                            ({imageFileInfo.size})
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Image ready to publish
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#0f766e] dark:text-[#D9A441] hover:underline font-semibold cursor-pointer"
                    >
                      Choose another file
                    </button>
                  </div>
                </div>
              )}
              {fieldErrors.thumbnailImageUrl && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.thumbnailImageUrl}</span>
                </p>
              )}
            </div>

            {/* Field 6: Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {formData.eventDescription.length} characters (min 20)
                </span>
              </div>
              <textarea
                name="eventDescription"
                rows={4}
                value={formData.eventDescription}
                onChange={handleChange}
                placeholder="Describe your initiative, schedule, objectives, and what volunteers should bring..."
                className={`w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e] transition-all leading-relaxed ${
                  fieldErrors.eventDescription ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-white/10"
                }`}
              />
              {fieldErrors.eventDescription && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.eventDescription}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <Link
                href="/upcoming-events"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-semibold py-2"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0f766e] hover:bg-[#0d9488] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Event...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Community Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

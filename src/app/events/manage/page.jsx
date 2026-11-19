"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Tag,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Search,
  Sparkles,
  Users,
  UploadCloud,
  FileImage,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/jwt-client";
import { formatEventDate } from "@/components/EventCard";
import ManageEventSkeleton from "@/components/skeletons/ManageEventSkeleton";

const CATEGORIES = [
  "Donation",
  "Cleanup",
  "Plantation",
  "Winter Relief",
  "Food Drive",
  "Health Camp",
  "Education",
];

export default function ManageEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    eventTitle: "",
    eventType: "Cleanup",
    eventDate: "",
    location: "",
    thumbnailImageUrl: "",
    eventDescription: "",
  });
  const [editFilePreview, setEditFilePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const editFileInputRef = useRef(null);

  // Delete Confirmation Modal State
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoggedIn = Boolean(session?.user);
  const user = session?.user;

  // Direct redirect to login page if user is not authenticated (no middle stage)
  useEffect(() => {
    if (!isPending && !isLoggedIn) {
      window.location.replace("/login?redirect=/events/manage");
    }
  }, [isPending, isLoggedIn]);

  // Date limits computed safely in useEffect to prevent Next.js prerender error
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setMinDate(tomorrow.toISOString().split("T")[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const validateEditField = (name, value) => {
    let err = "";
    if (name === "eventTitle") {
      if (!value.trim()) err = "Event Title is required.";
      else if (value.trim().length < 5) err = "Title must be at least 5 characters.";
    } else if (name === "eventType") {
      if (!value.trim()) err = "Category is required.";
    } else if (name === "eventDate") {
      const today = new Date().toISOString().split("T")[0];
      if (!value) err = "Event Date is required.";
      else if (value <= today) err = "Event date must be in the future (after today).";
    } else if (name === "location") {
      if (!value.trim()) err = "Location is required.";
      else if (value.trim().length < 3) err = "Location must be at least 3 characters.";
    } else if (name === "eventDescription") {
      if (!value.trim()) err = "Event Description is required.";
      else if (value.trim().length < 20) err = "Description must be at least 20 characters.";
    }
    setEditFieldErrors((prev) => ({ ...prev, [name]: err }));
    return err;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.eventTitle.trim()) {
      errors.eventTitle = "Event Title is required.";
    } else if (editFormData.eventTitle.trim().length < 5) {
      errors.eventTitle = "Title must be at least 5 characters.";
    }

    if (!editFormData.eventType.trim()) {
      errors.eventType = "Please select an event category.";
    }

    const today = new Date().toISOString().split("T")[0];
    if (!editFormData.eventDate) {
      errors.eventDate = "Event Date is required.";
    } else if (editFormData.eventDate <= today) {
      errors.eventDate = "Event date must be strictly in the future (no past or today).";
    }

    if (!editFormData.location.trim()) {
      errors.location = "Location is required.";
    } else if (editFormData.location.trim().length < 3) {
      errors.location = "Location must be at least 3 characters.";
    }

    if (!editFormData.thumbnailImageUrl) {
      errors.thumbnailImageUrl = "Thumbnail image is required.";
    }

    if (!editFormData.eventDescription.trim()) {
      errors.eventDescription = "Event Description is required.";
    } else if (editFormData.eventDescription.trim().length < 20) {
      errors.eventDescription = "Description must be at least 20 characters.";
    }

    setEditFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 1. Fetch events created by this logged-in user
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;
    let isMounted = true;

    async function fetchCreatedEvents() {
      try {
        setLoading(true);
        setError("");

        const authHeaders = await getAuthHeaders(user);
        const res = await fetch(
          `/api/events/creator?creatorEmail=${encodeURIComponent(user.email)}`,
          { headers: authHeaders, cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to load your created events");
        }

        const data = await res.json();
        if (isMounted) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching created events:", err);
        if (isMounted) {
          setError("Unable to load events. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!isPending && isLoggedIn && user?.email) {
      fetchCreatedEvents();
    }

    return () => {
      isMounted = false;
    };
  }, [isPending, isLoggedIn, user]);

  // Open Edit Modal with event prefilled
  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setEditFormData({
      eventTitle: event.eventTitle || "",
      eventType: event.eventType || "Cleanup",
      eventDate: event.eventDate || "",
      location: event.location || "",
      thumbnailImageUrl: event.thumbnailImageUrl || "",
      eventDescription: event.eventDescription || "",
    });
    setEditFilePreview(event.thumbnailImageUrl || null);
  };

  // Handle image file change for edit modal
  const handleEditImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotification({
        type: "error",
        message: "Please choose a valid image file (PNG, JPG, WEBP).",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
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

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setEditFormData((prev) => ({ ...prev, thumbnailImageUrl: dataUrl }));
        setEditFilePreview(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submit Update Event (PUT)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent?._id) return;

    if (!validateEditForm()) {
      setNotification({
        type: "error",
        message: "Please correct the highlighted errors in the form before saving.",
      });
      return;
    }

    try {
      setIsUpdating(true);
      setNotification({ type: "", message: "" });

      const authHeaders = await getAuthHeaders(user, {
        "Content-Type": "application/json",
      });

      const res = await fetch(`/api/events/${editingEvent._id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          ...editFormData,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      // Update local state
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === editingEvent._id
            ? { ...ev, ...editFormData, updatedAt: new Date() }
            : ev
        )
      );

      setNotification({
        type: "success",
        message: `"${editFormData.eventTitle}" was updated successfully!`,
      });

      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to update event.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Delete Event (DELETE)
  const handleDeleteConfirm = async () => {
    if (!deletingEvent?._id) return;

    try {
      setIsDeleting(true);
      setNotification({ type: "", message: "" });

      const authHeaders = await getAuthHeaders(user);
      const res = await fetch(
        `/api/events/${deletingEvent._id}?userEmail=${encodeURIComponent(user.email)}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      // Remove from local state
      setEvents((prev) => prev.filter((ev) => ev._id !== deletingEvent._id));

      setNotification({
        type: "success",
        message: `"${deletingEvent.eventTitle}" was successfully deleted.`,
      });

      setDeletingEvent(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to delete event.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter events by search keyword
  const filteredEvents = events.filter((ev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.eventTitle?.toLowerCase().includes(q) ||
      ev.location?.toLowerCase().includes(q) ||
      ev.eventType?.toLowerCase().includes(q) ||
      ev.eventDescription?.toLowerCase().includes(q)
    );
  });

  // Direct redirect state if unauthenticated or session pending (no middle stage)
  if (isPending || !isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0F0F] text-[#101010] dark:text-[#F5F1E8] pt-28 pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8E2D5] dark:border-white/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Organizer Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] tracking-tight">
              Manage Your Created Events
            </h1>
            <p className="text-sm sm:text-base text-[#666666] dark:text-gray-400 font-sans mt-2 max-w-2xl">
              View, edit details, or remove community initiatives you have published.
              You can only modify events you created.
            </p>
          </div>

          <Link
            href="/events/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all self-start md:self-end shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>

        {/* Global Notifications */}
        {notification.message && (
          <div
            className={`p-4 rounded-2xl mb-8 flex items-center justify-between gap-3 text-sm font-medium ${
              notification.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification({ type: "", message: "" })}
              className="text-xs hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar & Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your created events..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e] text-sm text-[#101010] dark:text-[#F5F1E8] placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-[#777777] dark:text-gray-400 self-end sm:self-center">
            Showing <strong className="text-[#101010] dark:text-white">{filteredEvents.length}</strong> created event{filteredEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Events Content with Skeleton */}
        {loading ? (
          <ManageEventSkeleton count={3} />
        ) : error ? (
          <div className="p-12 text-center bg-white dark:bg-[#181818] rounded-3xl border border-red-200 dark:border-red-900/50 max-w-xl mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-900 dark:text-red-300">{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center bg-white dark:bg-[#181818] rounded-3xl border border-[#E8E2D5] dark:border-white/10 max-w-xl mx-auto shadow-xs">
            <Calendar className="w-14 h-14 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
              No Created Events Found
            </h3>
            <p className="text-sm text-[#666666] dark:text-gray-400 font-sans mb-8 leading-relaxed">
              {searchQuery
                ? `No events matched your search "${searchQuery}".`
                : "You haven't created any community events yet. Organize a local cleanup, winter relief drive, or tree plantation to mobilize volunteers!"}
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Event</span>
            </Link>
          </div>
        ) : (
          /* 3-Column Responsive Management Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const formattedDate = formatEventDate(event.eventDate);
              const isDataUrl = Boolean(event.thumbnailImageUrl?.startsWith("data:"));
              const fallbackImage =
                "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200";

              return (
                <div
                  key={event._id}
                  className="bg-white dark:bg-[#181818] rounded-2xl border border-[#E8E2D5] dark:border-white/10 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={event.thumbnailImageUrl || fallbackImage}
                        alt={event.eventTitle || "Event Thumbnail"}
                        fill
                        unoptimized={isDataUrl}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      <span className="absolute top-4 left-4 bg-[#0f766e] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                        {event.eventType}
                      </span>

                      <span className="absolute bottom-3 left-4 text-xs font-semibold text-white flex items-center gap-1.5 drop-shadow-md">
                        <Calendar className="w-3.5 h-3.5 text-[#D9A441]" />
                        {formattedDate}
                      </span>

                      {/* Volunteer Counter Badge */}
                      <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#D9A441]" />
                        <span>{event.joinedCount || 0} Joined</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2 line-clamp-1">
                        {event.eventTitle}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-gray-400 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 font-sans line-clamp-2 leading-relaxed">
                        {event.eventDescription}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0">
                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
                      <Link
                        href={`/events/${event._id}`}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#0f766e] dark:hover:text-[#0f766e] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                        title="View Public Event Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(event)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F5] dark:bg-purple-950/30 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800/40 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingEvent(event)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. UPDATE EVENT MODAL */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingEvent(null)}
        >
          <div
            className="bg-white dark:bg-[#181818] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/10 my-4 sm:my-8 text-[#101010] dark:text-[#F5F1E8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-6">
              <div className="flex items-center gap-2 text-[#0f766e] dark:text-emerald-400">
                <Pencil className="w-5 h-5" />
                <h3 className="text-xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8]">
                  Update Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-5" noValidate>
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.eventTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData((prev) => ({ ...prev, eventTitle: val }));
                    validateEditField("eventTitle", val);
                  }}
                  className={`w-full px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:ring-2 focus:ring-[#0f766e] focus:outline-none ${
                    editFieldErrors.eventTitle ? "border-red-500" : "border-gray-200 dark:border-white/10"
                  }`}
                />
                {editFieldErrors.eventTitle && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editFieldErrors.eventTitle}</span>
                  </p>
                )}
              </div>

              {/* Event Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.eventType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditFormData((prev) => ({ ...prev, eventType: val }));
                      validateEditField("eventType", val);
                    }}
                    className={`w-full px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:ring-2 focus:ring-[#0f766e] focus:outline-none cursor-pointer ${
                      editFieldErrors.eventType ? "border-red-500" : "border-gray-200 dark:border-white/10"
                    }`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="dark:bg-[#202020] dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                  {editFieldErrors.eventType && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editFieldErrors.eventType}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={editFormData.eventDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditFormData((prev) => ({ ...prev, eventDate: val }));
                      validateEditField("eventDate", val);
                    }}
                    className={`w-full px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:ring-2 focus:ring-[#0f766e] focus:outline-none cursor-pointer ${
                      editFieldErrors.eventDate ? "border-red-500" : "border-gray-200 dark:border-white/10"
                    }`}
                  />
                  {editFieldErrors.eventDate && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editFieldErrors.eventDate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Location / Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData((prev) => ({ ...prev, location: val }));
                    validateEditField("location", val);
                  }}
                  className={`w-full px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:ring-2 focus:ring-[#0f766e] focus:outline-none ${
                    editFieldErrors.location ? "border-red-500" : "border-gray-200 dark:border-white/10"
                  }`}
                />
                {editFieldErrors.location && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editFieldErrors.location}</span>
                  </p>
                )}
              </div>

              {/* Thumbnail Image Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Update Thumbnail Image <span className="text-red-500">*</span>
                </label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleEditImageFile}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  {editFilePreview && (
                    <div className="relative h-20 w-28 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 bg-gray-100 dark:bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editFilePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF8F5] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-[#0f766e] dark:text-[#D9A441]" />
                    <span>Choose New Photo from Device</span>
                  </button>
                </div>
                {editFieldErrors.thumbnailImageUrl && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editFieldErrors.thumbnailImageUrl}</span>
                  </p>
                )}
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editFormData.eventDescription}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData((prev) => ({
                      ...prev,
                      eventDescription: val,
                    }));
                    validateEditField("eventDescription", val);
                  }}
                  className={`w-full px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#202020] border rounded-xl text-sm text-[#101010] dark:text-[#F5F1E8] focus:ring-2 focus:ring-[#0f766e] focus:outline-none leading-relaxed ${
                    editFieldErrors.eventDescription ? "border-red-500" : "border-gray-200 dark:border-white/10"
                  }`}
                />
                {editFieldErrors.eventDescription && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editFieldErrors.eventDescription}</span>
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-[#0f766e] hover:bg-[#0d9488] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION DIALOG */}
      {deletingEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeletingEvent(null)}
        >
          <div
            className="bg-white dark:bg-[#181818] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/10 text-center text-[#101010] dark:text-[#F5F1E8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl w-fit mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#101010] dark:text-[#F5F1E8] mb-2">
              Delete Event?
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{deletingEvent.eventTitle}&quot;</strong>?
              This will permanently remove the event and all volunteer registrations.
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Keep Event
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import CategoryFilter, { DEFAULT_CATEGORIES } from "@/components/CategoryFilter";
import UpcomingEvents from "@/components/UpcomingEvents";
import PastEvents from "@/components/PastEvents";

export default function EventsSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");

  useEffect( () => {
    // Set today's date safely on client mount to avoid SSR / Hydration mismatch
    const todayStr = new Date().toISOString().split("T")[0];
    setToday(todayStr);

    async function fetchDatabaseEvents() {
      setLoading(true);
      try {
        // Fetch real data from the database API
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        let res;

        try {
          // Attempt Express backend first
          res = await fetch(`${backendUrl}/events`, { cache: "no-store" });
        } catch {
          // Fallback to Next.js API route that connects directly to MongoDB
          res = await fetch("/api/events", { cache: "no-store" });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setEvents(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch events from database:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDatabaseEvents();
  }, []);

  // Filter events by selected category pill
  const filteredEvents = events.filter((evt) => {
    if (selectedCategory.toLowerCase() === "all") return true;
    return evt.eventType?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Upcoming: eventDate >= today, sorted ASCENDING (coming date first)
  // Previous days never show here
  const upcomingEvents = filteredEvents
    .filter((evt) => evt.eventDate && (!today || evt.eventDate >= today))
    .sort((a, b) => (a.eventDate > b.eventDate ? 1 : -1));

  // Past: eventDate < today, sorted DESCENDING (most recent past date first)
  const pastEvents = filteredEvents
    .filter((evt) => evt.eventDate && today && evt.eventDate < today)
    .sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));

  return (
    <div className="w-full bg-[#FAF8F5] text-charcoal py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Component 1: Category Filter Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={DEFAULT_CATEGORIES}
        />

        {/* Component 2: Upcoming Events (Sorted nearest date first) */}
        <UpcomingEvents
          events={upcomingEvents}
          loading={loading}
          selectedCategory={selectedCategory}
          onResetFilter={() => setSelectedCategory("All")}
        />

        {/* Component 3: Past Events (Completed events) */}
        <PastEvents
          events={pastEvents}
          selectedCategory={selectedCategory}
        />

      </div>
    </div>
  );
}

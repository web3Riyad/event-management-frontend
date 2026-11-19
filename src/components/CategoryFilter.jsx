"use client";

import React from "react";

export const DEFAULT_CATEGORIES = [
  "All",
  "Donation",
  "Cleanup",
  "Plantation",
  "Winter Relief",
  "Food Drive",
  "Health Camp",
  "Education",
];

export default function CategoryFilter({
  selectedCategory = "All",
  onSelectCategory,
  categories = DEFAULT_CATEGORIES,
}) {
  return (
    <section className="flex flex-col items-center">
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#0f766e] dark:text-emerald-400 font-bold">
          Explore by Initiative
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#101010] dark:text-[#F5F1E8] mt-1 font-semibold">
          Filter Event Categories
        </h2>
      </div>

      {/* Pill navigation container matching reference image */}
      <div className="w-full overflow-x-auto pb-4 pt-1 scrollbar-none flex justify-start sm:justify-center px-4 sm:px-0">
        <div className="inline-flex items-center gap-2 sm:gap-3 p-1.5 bg-white/70 dark:bg-[#181818]/90 backdrop-blur-md rounded-full border border-gray-200/80 dark:border-white/10 shadow-xs">
          {categories.map((category) => {
            const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(category)}
                className={`whitespace-nowrap px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#0f766e] text-white shadow-md shadow-[#0f766e]/30 scale-[1.02]"
                    : "bg-white dark:bg-[#222222] text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#262626] border border-gray-100 dark:border-white/10"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

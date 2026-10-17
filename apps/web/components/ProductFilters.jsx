"use client";

import React, { useState } from "react";

// আপনার দেওয়া সুনির্দিষ্ট ক্যাটাগরিভিত্তিক ব্র্যান্ড তালিকা
const CATEGORY_BRANDS = {
  desktop: [
    "Dell", "HP", "Lenovo", "ASUS", "Acer", 
    "Apple", "MSI", "Intel", "Gigabyte", "Fujitsu"
  ],
  laptop: [
    "Dell", "HP", "Lenovo", "ASUS", "Acer", 
    "Apple MacBook", "MSI", "Microsoft Surface", "Huawei", "Samsung"
  ],
  phone: [
    "Samsung", "Apple iPhone", "Xiaomi", "OPPO", "vivo", 
    "realme", "OnePlus", "Google Pixel", "HONOR", "Motorola"
  ],
  all: [
    "Dell", "HP", "Lenovo", "ASUS", "Acer", 
    "Apple", "MSI", "Intel", "Samsung", "Xiaomi"
  ]
};

export default function ProductFilter({ category = "all", onFilterChange }) {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(150000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [brandSearch, setBrandSearch] = useState("");

  // বর্তমান ক্যাটাগরি অনুযায়ী ব্র্যান্ড নির্ধারণ
  const currentBrands = CATEGORY_BRANDS[category] || CATEGORY_BRANDS.all;

  const filteredBrands = currentBrands.filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleBrandChange = (brand) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(updated);
  };

  const handleReset = () => {
    setSelectedBrands([]);
    setPriceRange(150000);
    setInStockOnly(false);
    setSelectedRating(null);
    setBrandSearch("");
  };

  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        selectedBrands,
        priceRange,
        inStockOnly,
        selectedRating,
      });
    }
  };

  return (
    <div className="w-full max-w-xs bg-white border border-gray-200 rounded-xl shadow-sm p-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>⚙️</span> প্রোডাক্ট ফিল্টার
        </h3>
        <button
          onClick={handleReset}
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          রিসেট
        </button>
      </div>

      {/* 1. Price Range Slider */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          দামের রেঞ্জ (Price Range)
        </label>
        <input
          type="range"
          min="1000"
          max="300000"
          step="1000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
        />
        <div className="flex justify-between items-center text-xs font-medium text-gray-600 mt-2">
          <span>৳ ১,০০০</span>
          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
            ৳ {priceRange.toLocaleString("bn-BD")} পর্যন্ত
          </span>
        </div>
      </div>

      {/* 2. Brand Search & Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          ব্র্যান্ড ({category.toUpperCase()})
        </label>
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="ব্র্যান্ড খুঁজুন..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
          />
          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {filteredBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-orange-600 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Availability Toggle */}
      <div className="mb-6 pt-4 border-t border-gray-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-800">
            শুধু স্টকে আছে (In Stock Only)
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600 relative"></div>
        </label>
      </div>

      {/* 4. Rating Filter */}
      <div className="mb-6 pt-4 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          রেটিং (Ratings)
        </label>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
              className={`w-full flex items-center justify-between text-xs px-3 py-1.5 rounded-lg border transition-all ${
                selectedRating === stars
                  ? "border-orange-500 bg-orange-50 text-orange-600 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < stars ? "text-amber-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-1 font-medium">{stars} স্টার ও উপরে</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={applyFilters}
        type="button"
        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-lg shadow transition-all cursor-pointer"
      >
        ফিল্টার প্রয়োগ করুন
      </button>
    </div>
  );
}
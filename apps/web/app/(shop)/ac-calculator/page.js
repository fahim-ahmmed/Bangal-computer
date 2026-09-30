"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const SUN_FACTORS = [
  { value: 0.9, label: "কম রোদ (উত্তরমুখী/ছায়াযুক্ত রুম)" },
  { value: 1.0, label: "স্বাভাবিক" },
  { value: 1.15, label: "বেশি রোদ (দক্ষিণ/পশ্চিমমুখী)" },
];

/**
 * Rule-of-thumb BTU sizing (common in BD AC shops):
 *   base BTU = area(sqft) × 20 × sunFactor × topFloorFactor
 *   + occupants beyond 2 × 400 BTU
 *   + heat-generating equipment × 600 BTU
 * Ton = BTU / 12000, rounded up to the nearest 0.5 ton (how ACs are sold).
 */
export default function AcCalculatorPage() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [sunFactor, setSunFactor] = useState(1.0);
  const [topFloor, setTopFloor] = useState(false);
  const [occupants, setOccupants] = useState(2);
  const [equipment, setEquipment] = useState(0);

  const result = useMemo(() => {
    const l = Number(length);
    const w = Number(width);
    if (!(l > 0) || !(w > 0)) return null;

    const area = l * w;
    const floorFactor = topFloor ? 1.1 : 1.0;
    const baseBtu = area * 20 * sunFactor * floorFactor;
    const occupantBtu = Math.max(0, Number(occupants) - 2) * 400;
    const equipmentBtu = Number(equipment) * 600;
    const totalBtu = baseBtu + occupantBtu + equipmentBtu;
    const rawTon = totalBtu / 12000;
    const recommendedTon = Math.ceil(rawTon * 2) / 2; // round up to nearest 0.5 ton

    return { area, totalBtu: Math.round(totalBtu), rawTon, recommendedTon };
  }, [length, width, sunFactor, topFloor, occupants, equipment]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">AC টন / লোড ক্যালকুলেটর</h1>
      <p className="mb-6 text-sm text-neutral-500">রুমের মাপ দিয়ে কত টনের এসি দরকার সেটার একটা আনুমানিক হিসাব পান।</p>

      <div className="space-y-4 rounded-xl border border-neutral-200 p-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">দৈর্ঘ্য (ফুট)</span>
            <input type="number" min="0" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" value={length} onChange={(e) => setLength(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">প্রস্থ (ফুট)</span>
            <input type="number" min="0" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" value={width} onChange={(e) => setWidth(e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">রোদের পরিমাণ</span>
          <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" value={sunFactor} onChange={(e) => setSunFactor(Number(e.target.value))}>
            {SUN_FACTORS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={topFloor} onChange={(e) => setTopFloor(e.target.checked)} />
          এটি ছাদের নিচের (টপ ফ্লোর) রুম
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">সাধারণত রুমে মানুষ থাকে</span>
            <input type="number" min="1" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" value={occupants} onChange={(e) => setOccupants(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">তাপ উৎপন্নকারী যন্ত্র (কম্পিউটার, টিভি...)</span>
            <input type="number" min="0" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
          </label>
        </div>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-5 text-center">
          <div className="text-sm text-neutral-600">রুমের আয়তন: {result.area} বর্গফুট</div>
          <div className="mt-2 text-4xl font-bold text-brand">{result.recommendedTon} টন</div>
          <div className="mt-1 text-sm text-neutral-500">আনুমানিক প্রয়োজন: {result.totalBtu.toLocaleString("en-BD")} BTU</div>
          <Link href={`/search?q=${encodeURIComponent(`${result.recommendedTon} Ton AC`)}`} className="mt-4 inline-block text-brand hover:underline">
            {result.recommendedTon} টনের এসি দেখুন →
          </Link>
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        এটি একটি সাধারণ আনুমানিক হিসাব — রুমের উচ্চতা, ইনসুলেশন ও জানালার সংখ্যার ভিত্তিতে প্রকৃত চাহিদা কিছুটা ভিন্ন হতে পারে। নিশ্চিত হতে টেকনিশিয়ানের পরামর্শ নিন।
      </p>
    </div>
  );
}

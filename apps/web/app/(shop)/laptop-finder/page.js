"use client";

import { useEffect, useState } from "react";
import { laptopFinderApi } from "@/lib/tools-client";
import ProductGrid from "@/components/ProductGrid";

const BUDGETS = [
  { label: "৳৩০,০০০-এর নিচে", min: 0, max: 30000 },
  { label: "৳৩০,০০০ – ৳৫০,০০০", min: 30000, max: 50000 },
  { label: "৳৫০,০০০ – ৳৮০,০০০", min: 50000, max: 80000 },
  { label: "৳৮০,০০০ – ৳১,৩০,০০০", min: 80000, max: 130000 },
  { label: "৳১,৩০,০০০-এর বেশি", min: 130000, max: 10000000 },
];

export default function LaptopFinderPage() {
  const [useCases, setUseCases] = useState([]);
  const [budget, setBudget] = useState(null);
  const [useCase, setUseCase] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    laptopFinderApi.useCases().then(setUseCases).catch(() => setUseCases([]));
  }, []);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const data = await laptopFinderApi.search({ budgetMin: budget.min, budgetMax: budget.max, useCase: useCase.value });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">Laptop Finder</h1>
      <p className="mb-6 text-sm text-neutral-500">আপনার বাজেট ও কাজের ধরন বলুন, আমরা মিলিয়ে দেখাব।</p>

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">বাজেট</h2>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.label}
              onClick={() => setBudget(b)}
              className={`rounded-full border px-4 py-1.5 text-sm ${budget === b ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700 hover:border-brand"}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">কীসের জন্য ব্যবহার করবেন</h2>
        <div className="flex flex-wrap gap-2">
          {useCases.map((u) => (
            <button
              key={u.value}
              onClick={() => setUseCase(u)}
              className={`rounded-full border px-4 py-1.5 text-sm ${useCase?.value === u.value ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700 hover:border-brand"}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={search}
        disabled={!budget || !useCase || loading}
        className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "খোঁজা হচ্ছে..." : "ল্যাপটপ খুঁজুন"}
      </button>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {results && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{results.length}টি মিল পাওয়া গেছে</h2>
          <ProductGrid products={results} />
        </div>
      )}
    </div>
  );
}

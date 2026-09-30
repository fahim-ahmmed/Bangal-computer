"use client";

import { useState } from "react";

export default function ProductGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const list = images?.length ? images : [];

  return (
    <div>
      <div className="aspect-square rounded-xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">
        {list[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={list[active]} alt={title} className="h-full w-full object-contain" />
        ) : (
          <span className="text-neutral-300">ছবি নেই</span>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 rounded-lg border overflow-hidden ${
                i === active ? "border-brand" : "border-neutral-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${title} ${i + 1}`} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

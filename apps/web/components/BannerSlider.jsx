"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BannerSlider({ banners = [] }) {
  const count = banners.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  const active = index % count;
  const go = (n) => setIndex((n + count) % count);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-neutral-200"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((banner, i) => {
        const Wrapper = banner.link ? Link : "div";
        const wrapperProps = banner.link ? { href: banner.link } : {};
        const isActive = i === active;
        return (
          <Wrapper
            key={banner._id || i}
            {...wrapperProps}
            aria-hidden={!isActive}
            tabIndex={isActive ? undefined : -1}
            className={`absolute inset-0 block transition-opacity duration-500 ${
              isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image}
              alt={banner.title || "Bangal Computer অফার"}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {banner.title && (
              <span className="absolute bottom-4 left-4 max-w-[70%] rounded-sm bg-neutral-950/75 px-3 py-1.5 text-xs font-semibold text-white sm:bottom-6 sm:left-6 sm:text-sm">
                {banner.title}
              </span>
            )}
          </Wrapper>
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="আগের স্লাইড"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-neutral-800 shadow transition hover:bg-white sm:left-4 sm:h-10 sm:w-10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="পরের স্লাইড"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-neutral-800 shadow transition hover:bg-white sm:right-4 sm:h-10 sm:w-10"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b._id || i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`স্লাইড ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === active ? "w-8 bg-brand" : "w-4 bg-white/80 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
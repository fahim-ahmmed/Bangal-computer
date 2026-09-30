"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BannerSlider({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;
  const banner = banners[index];

  const Wrapper = banner.link ? Link : "div";
  const wrapperProps = banner.link ? { href: banner.link } : {};

  return (
    <div className="relative h-full min-h-64 overflow-hidden bg-neutral-100">
      <Wrapper {...wrapperProps} className="group relative block h-full min-h-64 w-full bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.image}
          alt={banner.title || "Bangal Computer promotion"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        {banner.title && (
          <span className="absolute bottom-5 left-5 max-w-[75%] rounded-sm bg-neutral-950/75 px-3 py-2 text-sm font-semibold text-white sm:bottom-7 sm:left-7 sm:text-base">
            {banner.title}
          </span>
        )}
      </Wrapper>
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5 sm:bottom-4 sm:right-4">
          {banners.map((b, i) => (
            <button
              key={b._id}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${i === index ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white"}`}
              aria-label={`স্লাইড ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = ["/images/pic1.jpg", "/images/pic2.jpg"];

export default function TechnologyImageSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-neutral-900"
      aria-label="আপনার প্রয়োজনের প্রযুক্তি"
      aria-roledescription="carousel"
    >
      {images.map((src, imageIndex) => (
        <Image
          key={src}
          src={src}
          alt={`Bangal Computer স্টোর — ছবি ${imageIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={imageIndex === 0}
          className={`object-cover transition-opacity duration-700 ${
            index === imageIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/10 to-neutral-950/10" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
        <p className="text-lg font-bold text-white sm:text-2xl">
          আপনার প্রয়োজনের প্রযুক্তি
        </p>
        <div className="mt-4 flex gap-2" aria-label="ছবি নির্বাচন করুন">
          {images.map((src, imageIndex) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`ছবি ${imageIndex + 1} দেখুন`}
              aria-current={index === imageIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                index === imageIndex
                  ? "w-7 bg-white"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

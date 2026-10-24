import Link from "next/link";
import BannerSlider from "@/components/BannerSlider";

function SideBanner({ banner }) {
  const Wrapper = banner.link ? Link : "div";
  const wrapperProps = banner.link ? { href: banner.link } : {};
  return (
    <Wrapper
      {...wrapperProps}
      className="group relative block aspect-[11/5] overflow-hidden rounded-xl bg-neutral-200 lg:aspect-auto"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.image}
        alt={banner.title || "Bangal Computer অফার"}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      {banner.title && (
        <span className="absolute bottom-3 left-3 max-w-[85%] rounded-sm bg-neutral-950/75 px-2.5 py-1 text-xs font-semibold text-white">
          {banner.title}
        </span>
      )}
    </Wrapper>
  );
}

export default function BannerShowcase({ main = [], side = [] }) {
  const slides = main.length > 0 ? main : side;
  const sideList = main.length > 0 ? side.slice(0, 2) : [];
  if (slides.length === 0) return null;

  return (
    <section
      aria-label="অফার ও প্রচার"
      className={`grid gap-3 sm:gap-4 ${
        sideList.length > 0 ? "lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]" : ""
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl sm:aspect-[12/5]">
        <BannerSlider banners={slides} />
      </div>

      {sideList.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1 lg:grid-rows-2">
          {sideList.map((banner) => (
            <SideBanner key={banner._id} banner={banner} />
          ))}
        </div>
      )}
    </section>
  );
}
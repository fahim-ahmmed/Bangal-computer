import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import HeaderActions from "./HeaderActions";
import MegaMenu from "./MegaMenu";
import { getCategoryTree } from "@/lib/categories";

export default async function Header() {
  const tree = await getCategoryTree();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white shadow-[0_4px_18px_-12px_rgba(15,23,42,0.35)]">
      <div className="border-b border-white/10 bg-neutral-950 text-neutral-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] sm:text-xs">
          <span className="font-medium">বাংলাদেশের টেক পণ্য, আপনার পছন্দমতো</span>
          <div className="flex items-center gap-4">
            <Link href="/store-locator" className="transition-colors hover:text-white">স্টোর লোকেটর</Link>
            <Link href="/contact" className="hidden transition-colors hover:text-white sm:inline">যোগাযোগ</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-8 sm:py-4">
        <Link
          href="/"
          aria-label="Bangal Computer হোম"
          className="relative h-14 w-32 shrink-0 overflow-hidden sm:h-16 sm:w-40"
        >
          <Image
            src="/images/logo.jpg"
            alt="Bangal Computer"
            fill
            sizes="(max-width: 640px) 112px, 144px"
            className="object-cover"
            priority
          />
        </Link>
        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar />
        </div>
        <HeaderActions />
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>

      <MegaMenu tree={tree} />
    </header>
  );
}

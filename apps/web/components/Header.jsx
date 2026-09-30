import Link from "next/link";
import SearchBar from "./SearchBar";
import HeaderActions from "./HeaderActions";
import MegaMenu from "./MegaMenu";
import { getCategoryTree } from "@/lib/categories";

export default async function Header() {
  const tree = await getCategoryTree();

  return (
    <header className="w-full border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="border-b border-neutral-100 bg-neutral-950 text-neutral-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] sm:text-xs">
          <span>বাংলাদেশের টেক পণ্য, আপনার পছন্দমতো</span>
          <div className="flex items-center gap-4">
            <Link href="/store-locator" className="transition-colors hover:text-white">স্টোর লোকেটর</Link>
            <Link href="/contact" className="hidden transition-colors hover:text-white sm:inline">যোগাযোগ</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5">
        <Link href="/" className="shrink-0 text-xl font-bold text-brand transition-colors hover:text-brand-dark sm:text-2xl">
          Bangal Computer
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

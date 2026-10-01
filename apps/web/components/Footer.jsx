import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="Bangal Computer হোম"
              className="relative block h-14 w-40 overflow-hidden rounded-lg bg-white"
            >
              <Image
                src="/images/logo.jpg"
                alt="Bangal Computer"
                fill
                sizes="160px"
                className="object-cover"
              />
            </Link>
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              আপনার প্রযুক্তির নির্ভরযোগ্য ঠিকানা। পছন্দের প্রযুক্তি পণ্য খুঁজে নিন সহজে, নিশ্চিন্তে।
            </p>
            <Link
              href="/store-locator"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand hover:bg-brand/10"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              কাছের স্টোর খুঁজুন
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">সহায়তা</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/contact" className="transition-colors hover:text-white">যোগাযোগ</Link></li>
              <li><Link href="/complaint" className="transition-colors hover:text-white">অভিযোগ / ফিডব্যাক</Link></li>
              <li><Link href="/blog" className="transition-colors hover:text-white">ব্লগ ও নিউজ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">স্মার্ট টুলস</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/pc-builder" className="transition-colors hover:text-white">PC Builder</Link></li>
              <li><Link href="/laptop-finder" className="transition-colors hover:text-white">Laptop Finder</Link></li>
              <li><Link href="/ac-calculator" className="transition-colors hover:text-white">AC Ton ক্যালকুলেটর</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">আপনার অ্যাকাউন্ট</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/account/orders" className="transition-colors hover:text-white">অর্ডার হিস্ট্রি</Link></li>
              <li><Link href="/wishlist" className="transition-colors hover:text-white">উইশলিস্ট</Link></li>
              <li><Link href="/account" className="transition-colors hover:text-white">লয়্যালটি পয়েন্টস</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">আমাদের সাথে থাকুন</h3>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              নতুন পণ্য ও প্রযুক্তির আপডেট পেতে আমাদের সাথে যোগাযোগ রাখুন।
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-300 transition-colors hover:text-white"
            >
              আমাদের সাথে যোগাযোগ <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bangal Computer. সর্বস্বত্ব সংরক্ষিত।</p>
          <p>আপনার প্রযুক্তির নির্ভরযোগ্য ঠিকানা।</p>
        </div>
      </div>
    </footer>
  );
}

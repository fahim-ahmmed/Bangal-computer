import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-5 gap-8 text-sm">
        <div>
          <h3 className="text-white font-semibold mb-3">Bangal Computer</h3>
          <p>আপনার প্রযুক্তির নির্ভরযোগ্য ঠিকানা।</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">সহায়তা</h4>
          <ul className="space-y-1">
            <li><Link href="/contact" className="hover:text-white">যোগাযোগ</Link></li>
            <li><Link href="/complaint" className="hover:text-white">অভিযোগ / ফিডব্যাক</Link></li>
            <li><Link href="/blog" className="hover:text-white">ব্লগ ও নিউজ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">টুলস</h4>
          <ul className="space-y-1">
            <li><Link href="/pc-builder" className="hover:text-white">PC Builder</Link></li>
            <li><Link href="/laptop-finder" className="hover:text-white">Laptop Finder</Link></li>
            <li><Link href="/ac-calculator" className="hover:text-white">AC Ton ক্যালকুলেটর</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">অ্যাকাউন্ট</h4>
          <ul className="space-y-1">
            <li><Link href="/account/orders" className="hover:text-white">অর্ডার হিস্ট্রি</Link></li>
            <li><Link href="/wishlist" className="hover:text-white">উইশলিস্ট</Link></li>
            <li><Link href="/account" className="hover:text-white">লয়্যালটি পয়েন্টস</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">ব্রাঞ্চ</h4>
          <Link href="/store-locator" className="hover:text-white">স্টোর লোকেটর →</Link>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Bangal Computer. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}

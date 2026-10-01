import Link from "next/link";

const BENEFITS = [
  "অর্ডার ও ডেলিভারির আপডেট এক জায়গায়",
  "দ্রুত চেকআউটের জন্য ঠিকানা সংরক্ষণ",
  "লয়্যালটি পয়েন্ট ও অর্ডার হিস্ট্রি",
];

export default function AuthPageShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="min-h-[65vh] bg-[#f5f6f7] px-4 py-8 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-8 text-white md:flex lg:p-10">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold tracking-wide text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg">B</span>
              BANGAL COMPUTER
            </Link>
            <p className="mt-16 text-xs font-bold uppercase tracking-[0.2em] text-red-300">আপনার প্রযুক্তির নির্ভরযোগ্য ঠিকানা</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight lg:text-4xl">
              প্রযুক্তির কেনাকাটা হোক আরও সহজ।
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-300">
              আপনার অ্যাকাউন্টে সাইন ইন করে কেনাকাটার সবকিছু এক জায়গা থেকে পরিচালনা করুন।
            </p>
          </div>
          <ul className="relative mt-10 space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-neutral-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-300">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
          <p className="relative mt-10 text-xs text-neutral-400">নিরাপদ অ্যাকাউন্ট · নির্ভরযোগ্য সেবা</p>
        </aside>

        <section className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-neutral-700 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">B</span>
            BANGAL COMPUTER
          </Link>
          <div className="mt-7 md:mt-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-extrabold text-neutral-950 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
          </div>
          <div className="mt-7">{children}</div>
          <div className="mt-6 border-t border-neutral-100 pt-5">{footer}</div>
        </section>
      </div>
    </div>
  );
}

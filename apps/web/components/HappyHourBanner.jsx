import Link from "next/link";

export default function HappyHourBanner({ happyHour }) {
  if (!happyHour?.active) return null;
  return (
    <Link
      href="/search?q=happy hour"
      className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-red-500 px-5 py-3 text-white"
    >
      <div>
        <span className="font-bold">⚡ {happyHour.title || "Happy Hour"}</span>
        {happyHour.discountText && <span className="ml-2 text-sm">{happyHour.discountText}</span>}
      </div>
      <span className="text-sm underline">দেখুন →</span>
    </Link>
  );
}

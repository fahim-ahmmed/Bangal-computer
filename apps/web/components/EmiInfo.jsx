import { getEmiOptions, formatBDT } from "@/lib/format";

export default function EmiInfo({ price }) {
  const options = getEmiOptions(price);
  if (options.length === 0) return null;

  return (
    <div className="rounded-lg border border-dashed border-brand/40 bg-brand/5 p-3 text-sm">
      <div className="font-semibold text-brand mb-1">EMI সুবিধা উপলব্ধ</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-600">
        {options.map((opt) => (
          <span key={opt.months}>
            {opt.months} মাসে {formatBDT(opt.monthly)}/মাস
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-neutral-400">নির্দিষ্ট ব্যাংক কার্ডে প্রযোজ্য শর্ত সাপেক্ষে (আসল পেমেন্ট গেটওয়ে Part 6-এ)</p>
    </div>
  );
}

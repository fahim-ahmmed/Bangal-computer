import { branchesApi } from "@/lib/content-client";

export default async function StoreLocatorPage() {
  const branches = await branchesApi.list();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">স্টোর লোকেটর</h1>
      <p className="mb-6 text-sm text-neutral-500">{branches.length}টি ব্রাঞ্চ — নিকটতম শোরুম খুঁজুন</p>

      {branches.length === 0 ? (
        <p className="text-neutral-400">এখনো কোনো ব্রাঞ্চ যোগ করা হয়নি।</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {branches.map((b) => (
              <div key={b._id} className="rounded-xl border border-neutral-200 p-4">
                <h2 className="font-semibold text-neutral-800">{b.name}</h2>
                <p className="mt-1 text-sm text-neutral-600">{b.address}</p>
                <p className="mt-1 text-sm text-neutral-500">🕒 {b.hours}</p>
                {b.phone && <p className="text-sm text-neutral-500">📞 {b.phone}</p>}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-brand hover:underline"
                >
                  Google Maps-এ দেখুন →
                </a>
              </div>
            ))}
          </div>

          {/* No Maps JS API key required — an embeddable maps.google.com URL works for any number of pins via a query, here centered on the first branch */}
          <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 lg:aspect-auto lg:h-full">
            <iframe
              title="Bangal Computer branches map"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${branches[0].lat},${branches[0].lng}&z=12&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

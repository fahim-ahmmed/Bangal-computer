"use client";

import React from "react";

export default function OutletLocator() {
  const outlets = [
    {
      id: "kushtia-main",
      name: "Bengal Computers (কুষ্টিয়া আউটলেট)",
      address: "1st Floor, NS Rd, Kushtia 7000",
      phone: "01747-489300",
      hours: "শনিবার - বৃহস্পতিবার: ১০:০০ AM - ৯:০০ PM (শুক্রবার বন্ধ)",
      mapUrl: "https://maps.app.goo.gl/q1Dp6zyqLqztcaLn6",
      isPrimary: true,
    },
    {
      id: "dhaka-branch",
      name: "Bengal Computers (ঢাকা শাখা - মাল্টিপ্ল্যান)",
      address: "Multiplan Center, Elephant Road, Dhaka 1205",
      phone: "01700-000000",
      hours: "শনিবার - বৃহস্পতিবার: ১০:০০ AM - ৮:০০ PM",
      mapUrl: "https://maps.google.com",
      isPrimary: false,
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-orange-600">
            আমাদের আউটলেট ও স্টোর লোকেশন
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            আপনার নিকটস্থ বেঙ্গল কম্পিউটার শোরুমে ভিজিট করুন অথবা গুগল ম্যাপে লোকেশন দেখে নিন।
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative ${
                outlet.isPrimary ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-200"
              }`}
            >
              {outlet.isPrimary && (
                <span className="absolute -top-3 left-4 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  প্রধান শাখা
                </span>
              )}

              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📍</span> {outlet.name}
              </h2>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="flex items-start gap-2">
                  <strong className="text-gray-800 shrink-0">ঠিকানা:</strong>
                  <span>{outlet.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <strong className="text-gray-800 shrink-0">ফোন:</strong>
                  <a href={`tel:${outlet.phone}`} className="text-orange-600 hover:underline">
                    {outlet.phone}
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <strong className="text-gray-800 shrink-0">সময়সূচী:</strong>
                  <span>{outlet.hours}</span>
                </p>
              </div>

              {/* Google Maps Button */}
              <a
                href={outlet.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-lg shadow transition-all cursor-pointer"
              >
                {/* Map Pin Icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                গুগল ম্যাপে লোকেশন দেখুন
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
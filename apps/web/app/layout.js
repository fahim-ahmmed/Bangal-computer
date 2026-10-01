import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: [{ url: "/images/logo.jpg", type: "image/jpeg" }],
    shortcut: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  title: {
    default: "Bangal Computer — আপনার প্রযুক্তির নির্ভরযোগ্য ঠিকানা",
    template: "%s — Bangal Computer",
  },
  description:
    "Bangal Computer — ল্যাপটপ, ডেস্কটপ, কম্পোনেন্ট, মনিটর, গ্যাজেট ও আরও অনেক কিছু, সেরা দামে।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

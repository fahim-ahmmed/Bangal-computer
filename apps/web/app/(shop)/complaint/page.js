import ContactForm from "@/components/ContactForm";

export default function ComplaintPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">অভিযোগ / ফিডব্যাক</h1>
      <p className="mb-6 text-sm text-neutral-500">প্রোডাক্ট বা সার্ভিস নিয়ে কোনো সমস্যা হলে এখানে জানান — অর্ডার আইডি থাকলে দিন, দ্রুত সমাধান করা সহজ হবে।</p>
      <ContactForm type="complaint" showOrderId />
    </div>
  );
}

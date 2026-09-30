import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">যোগাযোগ করুন</h1>
      <p className="mb-6 text-sm text-neutral-500">কোনো প্রশ্ন থাকলে আমাদের জানান।</p>
      <ContactForm type="contact" />
    </div>
  );
}

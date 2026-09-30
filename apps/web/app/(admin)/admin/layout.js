import "@gravity-ui/uikit/styles/styles.css";
import { AdminProviders } from "./providers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
  title: "Bangal Computer — Admin",
};

/**
 * Route group (admin)/admin — separate from the storefront layout.
 * AdminGuard blocks non-admin/staff users in the UI; the Express API
 * re-checks the role on every request, so this is convenience, not security.
 */
export default function AdminLayout({ children }) {
  return (
    <AdminProviders>
      <AdminGuard>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="min-w-0 flex-1 bg-neutral-50 p-6">{children}</main>
        </div>
      </AdminGuard>
    </AdminProviders>
  );
}

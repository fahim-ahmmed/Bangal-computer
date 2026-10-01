import "@gravity-ui/uikit/styles/styles.css";
import { AdminProviders } from "./providers";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayoutFrame from "@/components/admin/AdminLayoutFrame";

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
        <AdminLayoutFrame>{children}</AdminLayoutFrame>
      </AdminGuard>
    </AdminProviders>
  );
}

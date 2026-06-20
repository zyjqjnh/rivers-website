import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <div className="flex min-h-screen bg-slate-50 max-lg:flex-col">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6 sm:p-8 xl:p-10">{children}</main>
    </div>
  );
}

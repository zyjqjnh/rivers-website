import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  return (
    <div className="flex min-h-screen bg-slate-50 max-lg:flex-col">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1 p-6 sm:p-8 xl:p-10">{children}</main>
    </div>
  );
}

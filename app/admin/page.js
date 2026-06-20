import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPage() {
  redirect((await isAdminAuthenticated()) ? "/admin/products" : "/admin/login");
}

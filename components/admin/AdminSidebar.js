"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ExternalLink, FolderTree, Inbox, LogOut, MessageCircle, RadioTower } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r bg-slate-950 text-slate-100 max-lg:min-h-0 max-lg:w-full">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400 text-slate-950"><RadioTower className="h-5 w-5" /></div>
        <div><div className="text-sm font-semibold tracking-[0.18em]">RIVERS</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Control Center</div></div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4 max-lg:flex-row max-lg:flex-wrap">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white", pathname.startsWith(href) && "bg-white/10 text-white")}>
            <Icon className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-4 max-lg:flex max-lg:items-center max-lg:gap-2 max-lg:space-y-0">
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-white/10 hover:text-white" asChild><Link href="/products"><ExternalLink />View website</Link></Button>
        <form action={logoutAction}><Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-white/10 hover:text-white" type="submit"><LogOut />Sign out</Button></form>
      </div>
    </aside>
  );
}

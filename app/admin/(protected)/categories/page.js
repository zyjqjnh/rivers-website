import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCategories } from "@/lib/products";
import { isDatabaseAvailable } from "@/lib/prisma";
import { CategoryActions } from "@/components/admin/CategoryActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({ searchParams }) {
  const categories = await getAdminCategories();
  const databaseReady = await isDatabaseAvailable();
  const params = await searchParams;
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Taxonomy</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Categories</h1><p className="mt-2 text-sm text-muted-foreground">{categories.length} categories used by the public catalogue and product forms.</p></div>
        <Button asChild={databaseReady} disabled={!databaseReady}>
          {databaseReady ? <Link href="/admin/categories/new"><Plus />Add category</Link> : <span><Plus />Add category</span>}
        </Button>
      </div>
      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable. Demo categories are shown.</div>}
      {params?.created && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Category created successfully.</div>}
      {params?.deleted && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Category deleted.</div>}
      {params?.error === "has-products" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">This category cannot be deleted because it still contains products. Move or delete those products first.</div>}
      {params?.error === "not-found" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">The category no longer exists.</div>}
      <Card><CardHeader><CardTitle>Product categories</CardTitle><CardDescription>Control catalogue grouping and display order.</CardDescription></CardHeader><CardContent className="p-0">
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead className="w-[120px]">Products</TableHead><TableHead className="w-[100px]">Order</TableHead><TableHead className="w-[140px] text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell><div className="font-medium">{category.name}</div><div className="mt-1 max-w-md text-xs text-muted-foreground">{category.description || "No description"}</div></TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{category.slug}</TableCell>
            <TableCell><Badge variant={category._count?.products ? "secondary" : "outline"}>{category._count?.products || 0}</Badge></TableCell>
            <TableCell>{category.sortOrder}</TableCell>
            <TableCell><CategoryActions category={category} canEdit={databaseReady} /></TableCell>
          </TableRow>
        ))}</TableBody></Table>
      </CardContent></Card>
    </>
  );
}

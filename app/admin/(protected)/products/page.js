import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { ProductActions } from "@/components/admin/ProductActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProducts } from "@/lib/products";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }) {
  const products = await getProducts({ includeDrafts: true });
  const databaseReady = await isDatabaseAvailable();
  const params = await searchParams;
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Catalogue</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Products</h1><p className="mt-2 text-sm text-muted-foreground">{products.length} products across the current catalogue.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link href="/admin/products/import"><Download />Import from Alibaba</Link></Button>
          <Button asChild><Link href="/admin/products/new"><Plus />Add product</Link></Button>
        </div>
      </div>
      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable, so the catalogue is temporarily shown in read-only demo mode.</div>}
      {params?.deleted && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Product deleted.</div>}
      <Card>
        <CardHeader><CardTitle>Product catalogue</CardTitle><CardDescription>Manage publishing status, content and public product pages.</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead className="w-[72px]">Image</TableHead><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="w-[180px] text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><img className="h-12 w-12 rounded-md border bg-slate-50 object-contain p-1" src={product.images?.[0]?.url || "/assets/67d6ba3c0e8ef810.jpg"} alt="" /></TableCell>
                  <TableCell><div className="font-medium">{product.name}</div><div className="mt-1 text-xs text-muted-foreground">{product.modelNumber || "No model number"}</div></TableCell>
                  <TableCell className="text-muted-foreground">{product.category?.name}</TableCell>
                  <TableCell><Badge variant={product.status === "PUBLISHED" ? "success" : product.status === "DRAFT" ? "warning" : "secondary"}>{product.status.toLowerCase()}</Badge></TableCell>
                  <TableCell><ProductActions product={product} canDelete={databaseReady} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

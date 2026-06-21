"use client";

import { useState } from "react";
import { AlertTriangle, Download, LoaderCircle, RotateCcw } from "lucide-react";
import { createProductAction } from "@/app/admin/actions";
import { ProductForm } from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AlibabaImportTool({ categories, databaseReady, storageReady }) {
  const [url, setUrl] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function importProduct(event) {
    event.preventDefault();
    setError("");
    setProduct(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/import-alibaba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The product could not be imported.");
      setProduct({
        ...result.product,
        status: "DRAFT",
        featured: false,
        categoryId: categories[0]?.id,
        images: result.product.images.map((imageUrl, index) => ({
          id: `imported-${index}`,
          url: imageUrl,
          alt: result.product.name,
          sortOrder: index,
        })),
        specifications: result.product.specifications.map((specification, index) => ({
          id: `imported-spec-${index}`,
          ...specification,
          sortOrder: index,
        })),
      });
    } catch (importError) {
      setError(importError.message || "The product could not be imported.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alibaba product URL</CardTitle>
          <CardDescription>Paste a public Alibaba.com product detail page. Nothing is saved until you review the draft and click Create draft.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={importProduct}>
            <div className="space-y-2">
              <Label htmlFor="alibaba-url">Product URL</Label>
              <Input
                id="alibaba-url"
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.alibaba.com/product-detail/..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <><LoaderCircle className="animate-spin" />Importing product…</> : <><Download />Fetch product details</>}
            </Button>
          </form>
          {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        </CardContent>
      </Card>

      {product && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-emerald-950">Import complete — review the draft</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-800">The fields below are editable. The product status is set to Draft by default.</p>
              {product.warnings?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-amber-900">
                  {product.warnings.map((warning) => <li className="flex gap-2" key={warning}><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{warning}</li>)}
                </ul>
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => setProduct(null)}><RotateCcw />Start over</Button>
          </div>

          <ProductForm
            key={product.sourceUrl}
            action={createProductAction}
            categories={categories}
            product={product}
            databaseReady={databaseReady}
            storageReady={storageReady}
            submitLabel="Create draft"
          />
        </div>
      )}
    </div>
  );
}

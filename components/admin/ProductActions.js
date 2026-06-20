"use client";

import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export function ProductActions({ product, canDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" asChild aria-label={`View ${product.name}`}><Link href={`/products/${product.slug}`}><ExternalLink /></Link></Button>
      <Button variant="ghost" size="icon" asChild aria-label={`Edit ${product.name}`}><Link href={`/admin/products/${product.id}/edit`}><Pencil /></Link></Button>
      {canDelete && <DeleteProductButton id={product.id} name={product.name} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/products/${product.slug}`}>Open product page</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/admin/products/${product.id}/edit`}>Edit product</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Duplicate — coming soon</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

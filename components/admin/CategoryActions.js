import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export function CategoryActions({ category, canEdit }) {
  const productCount = category._count?.products || 0;
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" asChild={canEdit} disabled={!canEdit} aria-label={`Edit ${category.name}`}>
        {canEdit ? <Link href={`/admin/categories/${category.id}/edit`}><Pencil /></Link> : <span><Pencil /></span>}
      </Button>
      {canEdit && <DeleteCategoryButton id={category.id} name={category.name} productCount={productCount} />}
    </div>
  );
}

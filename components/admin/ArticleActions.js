import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

export function ArticleActions({ article, canDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {article.status === "PUBLISHED" && <Button variant="ghost" size="icon" asChild aria-label={`View ${article.title}`}><Link href={`/knowledge/${article.slug}`}><ExternalLink /></Link></Button>}
      <Button variant="ghost" size="icon" asChild aria-label={`Edit ${article.title}`}><Link href={`/admin/knowledge/${article.id}/edit`}><Pencil /></Link></Button>
      {canDelete && <DeleteArticleButton id={article.id} title={article.title} />}
    </div>
  );
}

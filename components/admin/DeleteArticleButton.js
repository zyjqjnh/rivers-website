"use client";

import { Trash2 } from "lucide-react";
import { deleteKnowledgeArticleAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function DeleteArticleButton({ id, title }) {
  const action = deleteKnowledgeArticleAction.bind(null, id);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Delete ${title}`}><Trash2 /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete article?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes “{title}” and its product links. This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action} className="flex w-full sm:w-auto" style={{ margin: 0 }}><Button className="w-full sm:w-auto" variant="destructive" type="submit">Delete article</Button></form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

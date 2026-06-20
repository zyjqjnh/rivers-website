"use client";

import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function DeleteCategoryButton({ id, name, productCount }) {
  if (productCount > 0) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title={`${productCount} product${productCount === 1 ? "" : "s"} must be moved or deleted first`}
        aria-label={`Cannot delete ${name}; category contains products`}
      >
        <Trash2 />
      </Button>
    );
  }

  const action = deleteCategoryAction.bind(null, id);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${name}`}><Trash2 /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes “{name}”. The category is currently empty, but the server will check again before deleting it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action} className="flex w-full sm:w-auto" style={{ margin: 0 }}>
            <AlertDialogAction className="w-full sm:w-auto" type="submit">Delete category</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

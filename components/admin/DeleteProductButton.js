"use client";

import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function DeleteProductButton({ id, name, inquiryCount = 0 }) {
  if (inquiryCount > 0) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title={`${inquiryCount} inquir${inquiryCount === 1 ? "y references" : "ies reference"} this product`}
        aria-label={`Cannot delete ${name}; product is referenced by inquiries`}
      >
        <Trash2 />
      </Button>
    );
  }

  const action = deleteProductAction.bind(null, id);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${name}`}><Trash2 /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes “{name}”, its images and specifications. The server will check for inquiry references before deleting it.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action} className="flex w-full sm:w-auto" style={{ margin: 0 }}>
            <Button className="w-full sm:w-auto" variant="destructive" type="submit">Delete product</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

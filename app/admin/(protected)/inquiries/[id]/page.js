import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInquiryById } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);
  if (!inquiry) notFound();

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" className="-ml-3 mb-4" asChild><Link href="/admin/inquiries"><ArrowLeft />Back to inquiries</Link></Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">RFQ details</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{inquiry.email}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Received {formatDate(inquiry.createdAt)}</p>
          </div>
          <Badge variant={inquiry.status === "NEW" ? "warning" : "secondary"}>{inquiry.status.toLowerCase()}</Badge>
        </div>
      </div>

      <div className="grid max-w-5xl gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <Card>
          <CardHeader><CardTitle>Contact and setup</CardTitle><CardDescription>Details supplied with the request.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <Detail label="Work email"><a className="inline-flex items-center gap-2 text-emerald-700 underline-offset-4 hover:underline" href={`mailto:${inquiry.email}`}><Mail className="h-4 w-4" />{inquiry.email}</a></Detail>
            <Detail label="Voltage">{inquiry.voltage || "Not provided"}</Detail>
            <Detail label="Control range">{inquiry.range || "Not provided"}</Detail>
            {inquiry.company && <Detail label="Company">{inquiry.company}</Detail>}
            {inquiry.name && <Detail label="Contact name">{inquiry.name}</Detail>}
            {inquiry.phone && <Detail label="Phone">{inquiry.phone}</Detail>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Application and requirements</CardTitle><CardDescription>The customer’s full message.</CardDescription></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{inquiry.message}</p>
            {inquiry.items.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="mb-3 text-sm font-semibold">Referenced products</h3>
                <div className="space-y-2">
                  {inquiry.items.map(({ product }) => (
                    <Link className="block rounded-lg border p-3 text-sm hover:bg-slate-50" href={`/admin/products/${product.id}/edit`} key={product.id}>
                      <span className="font-medium">{product.name}</span>
                      {product.modelNumber && <span className="ml-2 text-muted-foreground">{product.modelNumber}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Detail({ label, children }) {
  return <div><div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{children}</div></div>;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

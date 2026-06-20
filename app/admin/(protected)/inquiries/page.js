import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInquiries } from "@/lib/inquiries";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusVariants = {
  NEW: "warning",
  CONTACTED: "secondary",
  QUOTED: "success",
  CLOSED: "outline",
};

export default async function InquiriesPage() {
  const [inquiries, databaseReady] = await Promise.all([getInquiries(), isDatabaseAvailable()]);
  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Customer requests</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Inquiries</h1>
        <p className="mt-2 text-sm text-muted-foreground">{inquiries.length} RFQ submissions received from the website.</p>
      </div>

      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable. New website inquiries cannot be stored or displayed.</div>}

      <Card>
        <CardHeader>
          <CardTitle>RFQ submissions</CardTitle>
          <CardDescription>Review contact details and technical requirements submitted through the website.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {inquiries.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Requirement</TableHead><TableHead>Status</TableHead><TableHead>Received</TableHead><TableHead className="w-[90px] text-right">View</TableHead></TableRow></TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.email}</TableCell>
                    <TableCell><div className="max-w-md truncate text-muted-foreground">{inquiry.message}</div><div className="mt-1 text-xs text-muted-foreground">{inquiry.voltage || "No voltage"} · {inquiry.range || "No range"}</div></TableCell>
                    <TableCell><Badge variant={statusVariants[inquiry.status] || "secondary"}>{inquiry.status.toLowerCase()}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(inquiry.createdAt)}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" asChild aria-label={`View inquiry from ${inquiry.email}`}><Link href={`/admin/inquiries/${inquiry.id}`}><Eye /></Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center">
              <p className="font-medium">No inquiries yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Website RFQ submissions will appear here automatically.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

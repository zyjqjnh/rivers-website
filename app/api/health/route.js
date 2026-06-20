import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await isDatabaseAvailable();
  return NextResponse.json(
    { status: database ? "ok" : "unhealthy", database },
    { status: database ? 200 : 503 },
  );
}

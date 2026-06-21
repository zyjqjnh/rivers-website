import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { importAlibabaProduct } from "@/lib/alibaba-import";

export const runtime = "nodejs";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid import request." }, { status: 400 });
  }

  try {
    const product = await importAlibabaProduct(input.url);
    return NextResponse.json({ product });
  } catch (error) {
    const message = error?.name === "TimeoutError"
      ? "Alibaba took too long to respond. Try again in a moment."
      : error?.message || "The product could not be imported.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const inquirySchema = z.object({
  email: z.string().trim().email().max(200),
  voltage: z.string().trim().min(1).max(100),
  range: z.string().trim().max(100).optional(),
  message: z.string().trim().min(10).max(5000),
});

export async function createInquiryAction(_previousState, formData) {
  if (!isDatabaseConfigured) {
    return { success: false, message: "The inquiry service is temporarily unavailable. Please try again later." };
  }

  const parsed = inquirySchema.safeParse({
    email: formData.get("email"),
    voltage: formData.get("voltage"),
    range: formData.get("range"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, message: "Please check your email and provide enough detail about the application." };
  }

  try {
    await prisma.inquiry.create({
      data: {
        email: parsed.data.email,
        voltage: parsed.data.voltage,
        range: parsed.data.range || null,
        message: parsed.data.message,
      },
    });
    revalidatePath("/admin/inquiries");
    return { success: true, message: "" };
  } catch {
    return { success: false, message: "We could not save your requirement. Please try again." };
  }
}

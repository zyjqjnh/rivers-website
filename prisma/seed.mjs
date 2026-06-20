import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Remote Controllers", slug: "remote-controllers", description: "Handheld and industrial RF transmitters.", sortOrder: 1 },
  { name: "Receivers & Switches", slug: "receivers-switches", description: "Relay receivers and wireless control switches.", sortOrder: 2 },
  { name: "RF Modules", slug: "rf-modules", description: "Compact modules for product integration.", sortOrder: 3 },
  { name: "Sensors", slug: "sensors", description: "Wireless sensors for safety and automation.", sortOrder: 4 },
];

const products = [
  {
    name: "12-Key Long Range Industrial Remote", slug: "12-key-long-range-industrial-remote", modelNumber: "RIV-TX12",
    shortDescription: "Rugged multi-channel transmitter for industrial control, access and automation.",
    description: "A configurable industrial RF transmitter designed for multi-channel control requirements. Frequency, coding and enclosure labeling can be customized for your application.",
    categorySlug: "remote-controllers", image: "/assets/67d6ba3c0e8ef810.jpg",
    specs: [["Frequency", "315 / 433.92 / 868 MHz"], ["Channels", "1–12"], ["Control range", "Up to 2000 m"]],
  },
  {
    name: "8-Channel Relay Receiver Kit", slug: "8-channel-relay-receiver-kit", modelNumber: "RIV-RX08",
    shortDescription: "Multi-channel receiver and transmitter kit for motors, gates and equipment.",
    description: "A flexible eight-channel receiver system with configurable momentary, toggle and latched control modes.",
    categorySlug: "receivers-switches", image: "/assets/9e20d569296ac1e0.jpg",
    specs: [["Input voltage", "DC 12V"], ["Channels", "8"], ["Control modes", "Momentary / Toggle / Latched"]],
  },
  {
    name: "433 MHz Learning Code Receiver Module", slug: "433mhz-learning-code-receiver-module", modelNumber: "RIV-MOD433",
    shortDescription: "Compact decoder module for integration into smart devices and control boards.",
    description: "A compact RF receiver and decoder module suitable for embedded control applications and rapid product integration.",
    categorySlug: "rf-modules", image: "/assets/c3329360a0cec71d.jpg",
    specs: [["Frequency", "433.92 MHz"], ["Code", "EV1527 learning code"], ["Application", "Embedded integration"]],
  },
  {
    name: "Wireless PIR Motion Sensor", slug: "wireless-pir-motion-sensor", modelNumber: "RIV-PIR433",
    shortDescription: "Low-power wireless motion detector for alarm and smart-home systems.",
    description: "A compact PIR sensor with wireless transmission for home security, safety and automation applications.",
    categorySlug: "sensors", image: "/assets/1e60bd480a0609fc.jpg",
    specs: [["Frequency", "433 MHz"], ["Power", "Low power"], ["Use", "Security / Smart home"]],
  },
];

async function main() {
  const adminEmail = String(process.env.ADMIN_EMAIL || "admin@rivers.local").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "");
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is required to create the initial administrator account.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Rivers Administrator",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Rivers Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });

  const categoryMap = {};
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryMap[category.slug] = saved.id;
  }

  for (const [index, product] of products.entries()) {
    const data = {
      name: product.name,
      slug: product.slug,
      modelNumber: product.modelNumber,
      shortDescription: product.shortDescription,
      description: product.description,
      status: "PUBLISHED",
      featured: index < 3,
      sortOrder: index + 1,
      categoryId: categoryMap[product.categorySlug],
      publishedAt: new Date(),
      images: { create: [{ url: product.image, alt: product.name, sortOrder: 0 }] },
      specifications: {
        create: product.specs.map(([label, value], sortOrder) => ({ label, value, sortOrder })),
      },
    };

    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productSpecification.deleteMany({ where: { productId: existing.id } });
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({ data });
    }
  }
}

main()
  .then(() => console.log("Rivers administrator and product seed completed."))
  .finally(() => prisma.$disconnect());

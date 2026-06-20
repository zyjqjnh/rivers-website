export const demoCategories = [
  { id: "demo-remote", name: "Remote Controllers", slug: "remote-controllers", description: "Handheld and industrial RF transmitters.", sortOrder: 1 },
  { id: "demo-receiver", name: "Receivers & Switches", slug: "receivers-switches", description: "Relay receivers and wireless control switches.", sortOrder: 2 },
  { id: "demo-module", name: "RF Modules", slug: "rf-modules", description: "Compact modules for product integration.", sortOrder: 3 },
  { id: "demo-sensor", name: "Sensors", slug: "sensors", description: "Wireless sensors for safety and automation.", sortOrder: 4 },
];

export const demoProducts = [
  {
    id: "demo-1", name: "12-Key Long Range Industrial Remote", slug: "12-key-long-range-industrial-remote",
    modelNumber: "RIV-TX12", shortDescription: "Rugged multi-channel transmitter for industrial control, access and automation.",
    description: "A configurable industrial RF transmitter designed for multi-channel control requirements. Frequency, coding and enclosure labeling can be customized for your application.",
    status: "PUBLISHED", featured: true, sortOrder: 1, categoryId: "demo-remote", category: demoCategories[0],
    images: [{ id: "img-1", url: "/assets/67d6ba3c0e8ef810.jpg", alt: "12-key long range industrial remote", sortOrder: 0 }],
    specifications: [
      { id: "spec-1", label: "Frequency", value: "315 / 433.92 / 868 MHz", sortOrder: 0 },
      { id: "spec-2", label: "Channels", value: "1–12", sortOrder: 1 },
      { id: "spec-3", label: "Control range", value: "Up to 2000 m", sortOrder: 2 },
    ],
  },
  {
    id: "demo-2", name: "8-Channel Relay Receiver Kit", slug: "8-channel-relay-receiver-kit",
    modelNumber: "RIV-RX08", shortDescription: "Multi-channel receiver and transmitter kit for motors, gates and equipment.",
    description: "A flexible eight-channel receiver system with configurable momentary, toggle and latched control modes.",
    status: "PUBLISHED", featured: true, sortOrder: 2, categoryId: "demo-receiver", category: demoCategories[1],
    images: [{ id: "img-2", url: "/assets/9e20d569296ac1e0.jpg", alt: "8-channel relay receiver kit", sortOrder: 0 }],
    specifications: [
      { id: "spec-4", label: "Input voltage", value: "DC 12V", sortOrder: 0 },
      { id: "spec-5", label: "Channels", value: "8", sortOrder: 1 },
      { id: "spec-6", label: "Control modes", value: "Momentary / Toggle / Latched", sortOrder: 2 },
    ],
  },
  {
    id: "demo-3", name: "433 MHz Learning Code Receiver Module", slug: "433mhz-learning-code-receiver-module",
    modelNumber: "RIV-MOD433", shortDescription: "Compact decoder module for integration into smart devices and control boards.",
    description: "A compact RF receiver and decoder module suitable for embedded control applications and rapid product integration.",
    status: "PUBLISHED", featured: true, sortOrder: 3, categoryId: "demo-module", category: demoCategories[2],
    images: [{ id: "img-3", url: "/assets/c3329360a0cec71d.jpg", alt: "433 MHz receiver module", sortOrder: 0 }],
    specifications: [
      { id: "spec-7", label: "Frequency", value: "433.92 MHz", sortOrder: 0 },
      { id: "spec-8", label: "Code", value: "EV1527 learning code", sortOrder: 1 },
      { id: "spec-9", label: "Application", value: "Embedded integration", sortOrder: 2 },
    ],
  },
  {
    id: "demo-4", name: "Wireless PIR Motion Sensor", slug: "wireless-pir-motion-sensor",
    modelNumber: "RIV-PIR433", shortDescription: "Low-power wireless motion detector for alarm and smart-home systems.",
    description: "A compact PIR sensor with wireless transmission for home security, safety and automation applications.",
    status: "PUBLISHED", featured: false, sortOrder: 4, categoryId: "demo-sensor", category: demoCategories[3],
    images: [{ id: "img-4", url: "/assets/1e60bd480a0609fc.jpg", alt: "Wireless PIR motion sensor", sortOrder: 0 }],
    specifications: [
      { id: "spec-10", label: "Frequency", value: "433 MHz", sortOrder: 0 },
      { id: "spec-11", label: "Power", value: "Low power", sortOrder: 1 },
      { id: "spec-12", label: "Use", value: "Security / Smart home", sortOrder: 2 },
    ],
  },
];

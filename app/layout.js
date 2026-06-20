import "./globals.css";

export const metadata = {
  title: {
    default: "Rivers RF Control — Wireless Control, Engineered to Fit",
    template: "%s | Rivers RF Control",
  },
  description: "RF remote controls, receivers and modules engineered for access control, motors, lighting and smart devices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

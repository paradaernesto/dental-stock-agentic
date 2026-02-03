import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dental Inventory",
  description: "Inventory management for dental clinics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { ConfigProvider } from "antd";
import "./globals.css";
import "antd/dist/reset.css";

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
      <body>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}

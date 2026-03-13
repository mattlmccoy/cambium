import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cambium Admin",
  description: "Internal tools for Cambium operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

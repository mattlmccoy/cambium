import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cambium Design - Custom Furniture, Locally Made",
  description:
    "Design personalized furniture crafted from locally-sourced wood at microfactories near you.",
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

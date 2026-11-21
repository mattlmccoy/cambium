import { Suspense } from "react";
import ConfigureClient from "@/app/configure/[productSlug]/ConfigureClient";
export function generateStaticParams() {
  return ["side-table", "table", "chair", "shelf"].map(productSlug => ({ productSlug }));
}
export default async function StudioPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  return <Suspense><ConfigureClient productSlug={productSlug} studio /></Suspense>;
}

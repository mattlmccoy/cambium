import ConfigureClient from "./ConfigureClient";

export function generateStaticParams() {
  return [
    { productSlug: "side-table" },
    { productSlug: "table" },
    { productSlug: "chair" },
    { productSlug: "shelf" },
  ];
}

export default async function ConfigurePage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  return <ConfigureClient productSlug={productSlug} />;
}

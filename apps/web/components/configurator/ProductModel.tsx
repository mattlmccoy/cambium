"use client";

import { useConfiguratorStore } from "@/lib/configurator-store";
import { ChairModel } from "./models/ChairModel";
import { DiningTableModel } from "./models/DiningTableModel";
import { ShelfModel } from "./models/ShelfModel";
import { SideTableModel } from "./models/SideTableModel";

export function ProductModel() {
  const productSlug = useConfiguratorStore((state) => state.productSlug);

  switch (productSlug) {
    case "table":
      return <DiningTableModel />;
    case "chair":
      return <ChairModel />;
    case "shelf":
      return <ShelfModel />;
    case "side-table":
    default:
      return <SideTableModel />;
  }
}

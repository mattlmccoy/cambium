"use client";

import type { GeometryPart } from "@cambium/shared";
import { PartMesh } from "./PartMesh";

export function CoreMesh({ part }: { part: GeometryPart }) {
  const color =
    part.material === "plastic" ? "#5c554c" : part.type === "brace" ? "#3f4447" : "#232629";
  return <PartMesh part={part} color={color} />;
}

import type { BOMResult, GeometryResult, ShelfParams, ValidationResult } from "@cambium/shared";
import { SHELF_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { panel, beam, tube, bounds, collectionBOM } from "./collection";

export function normalizeShelfParams(params: ShelfParams): ShelfParams {
  const shelfThickness = params.shelfDepth > 300 ? Math.max(20, params.shelfThickness) : params.shelfThickness;
  return { ...params, shelfThickness };
}

export function validateShelf(params: ShelfParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  checkRange("shelfWidth", params.shelfWidth, SHELF_CONSTRAINTS.shelfWidth.min, SHELF_CONSTRAINTS.shelfWidth.max, errors, "Shelf width");
  checkRange("shelfDepth", params.shelfDepth, SHELF_CONSTRAINTS.shelfDepth.min, SHELF_CONSTRAINTS.shelfDepth.max, errors, "Shelf depth");
  checkRange("shelfThickness", params.shelfThickness, SHELF_CONSTRAINTS.shelfThickness.min, SHELF_CONSTRAINTS.shelfThickness.max, errors, "Shelf thickness");
  checkRange("shelfCount", params.shelfCount, SHELF_CONSTRAINTS.shelfCount.min, SHELF_CONSTRAINTS.shelfCount.max, errors, "Shelf count", "");
  checkRange("unitHeight", params.unitHeight, SHELF_CONSTRAINTS.unitHeight.min, SHELF_CONSTRAINTS.unitHeight.max, errors, "Unit height");
  checkRange("shelfSpacing", params.shelfSpacing, SHELF_CONSTRAINTS.shelfSpacing.min, SHELF_CONSTRAINTS.shelfSpacing.max, errors, "Shelf spacing");
  if (params.shelfDepth > 300 && params.shelfThickness < 20) {
    warn(warnings, "shelfThickness", "Deep shelves use a 20mm minimum shelf thickness.");
  }
  if (params.mountType === "free-standing" && params.unitHeight > 1500) {
    warn(warnings, "unitHeight", "Tall free-standing shelves include a rear stabilizer brace.");
  }
  if (params.mountType === 'free-standing' && 80+(params.shelfCount-1)*params.shelfSpacing+params.shelfThickness/2 > params.unitHeight) {
    errors.push({field:'shelfSpacing',message:'The selected shelf count and spacing exceed the frame height. Increase height or reduce spacing.'});
  }
  return createValidationResult(errors, warnings);
}

export function generateShelfGeometry(p: ShelfParams): GeometryResult {
  const parts: GeometryResult['parts']=[];
  const x=p.shelfWidth/2-35,z=p.shelfDepth/2-24;
  if(p.mountType==='free-standing') {
    for(const sx of [-1,1])for(const sz of [-1,1])parts.push(tube(`upright-${sx}-${sz}`,20,p.unitHeight,20,{x:sx*x,y:p.unitHeight/2,z:sz*z}));
    // A genuine diagonal, rather than the old vertical "stabilizer".
    parts.push(beam('rear-brace',{x:-x,y:50,z:-p.shelfDepth/2-12},{x:x,y:p.unitHeight-30,z:-p.shelfDepth/2-12},10));
  }
  const spacing=p.shelfSpacing;
  for(let i=0;i<p.shelfCount;i++) {
    const y=p.mountType==='free-standing'?80+i*spacing:p.shelfThickness/2+i*p.shelfSpacing;
    const shelf=panel(`shelf-${i}`,p.shelfWidth,p.shelfThickness,p.shelfDepth,{x:0,y,z:0},p.edgeProfile,16);
    if(p.mountType==='free-standing' && shelf.shape.kind==='profile-panel')shelf.shape.holes=[-1,1].flatMap(sx=>[-1,1].map(sz=>({x:sx*x,z:sz*z,width:22,depth:22})));
    parts.push(shelf);
    for(const sign of [-1,1]) {
      parts.push(beam(`support-${i}-${sign}`,{x:sign*x,y:y-p.shelfThickness/2-10,z:-z},{x:sign*x,y:y-p.shelfThickness/2-10,z:z}));
      if(p.mountType==='wall-mount')parts.push(tube(`wall-plate-${i}-${sign}`,30,90,4,{x:sign*x,y:y-35,z:-p.shelfDepth/2-2}));
    }
  }
  if(p.backPanel)parts.push(panel('back-panel',p.shelfWidth-40,10,p.mountType==='free-standing'?p.unitHeight-80:(p.shelfCount-1)*p.shelfSpacing+p.shelfThickness,{x:0,y:p.mountType==='free-standing'?p.unitHeight/2:(p.shelfCount-1)*p.shelfSpacing/2+p.shelfThickness/2,z:-p.shelfDepth/2+5},'square',3,{x:Math.PI/2,y:0,z:0}));
  return bounds(parts);
}
export function generateShelfBOM(p: ShelfParams): BOMResult {
  return collectionBOM(generateShelfGeometry(p),p.woodSpecies,p.shelfCount*8+4,p.mountType==='free-standing'?12:6);
}

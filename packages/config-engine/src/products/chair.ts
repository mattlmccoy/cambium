import type { BOMResult, ChairParams, GeometryResult, ValidationResult } from "@cambium/shared";
import { CHAIR_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { panel, beam, tableFrame, bounds, collectionBOM } from "./collection";

export function normalizeChairParams(params: ChairParams): ChairParams {
  return { ...params };
}

export function validateChair(params: ChairParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  checkRange("seatWidth", params.seatWidth, CHAIR_CONSTRAINTS.seatWidth.min, CHAIR_CONSTRAINTS.seatWidth.max, errors, "Seat width");
  checkRange("seatDepth", params.seatDepth, CHAIR_CONSTRAINTS.seatDepth.min, CHAIR_CONSTRAINTS.seatDepth.max, errors, "Seat depth");
  checkRange("seatHeight", params.seatHeight, CHAIR_CONSTRAINTS.seatHeight.min, CHAIR_CONSTRAINTS.seatHeight.max, errors, "Seat height");
  checkRange("backHeight", params.backHeight, CHAIR_CONSTRAINTS.backHeight.min, CHAIR_CONSTRAINTS.backHeight.max, errors, "Back height");
  checkRange("seatThickness", params.seatThickness, CHAIR_CONSTRAINTS.seatThickness.min, CHAIR_CONSTRAINTS.seatThickness.max, errors, "Seat thickness");
  if (params.seatHeight + params.backHeight > 980) {
    warn(warnings, "backHeight", "Combined seat and back height is outside the preferred chair envelope.");
  }
  return createValidationResult(errors, warnings);
}

export function generateChairGeometry(p: ChairParams): GeometryResult {
  const parts=tableFrame(p.seatWidth,p.seatDepth,p.seatHeight,p.seatThickness,p.legWrapStyle);
  const seat=panel('seat',p.seatWidth,p.seatThickness,p.seatDepth,{x:0,y:p.seatHeight-p.seatThickness/2,z:0},'roundover',48,undefined,false,p.seatContour==='scoop'?5:0);
  if(seat.shape.kind==='profile-panel')seat.shape.holes=[-1,1].map(sign=>({x:sign*(p.seatWidth/2-65),z:p.seatDepth/2-63,width:18,depth:22}));
  parts.push(seat);
  const backZ=p.seatDepth/2-65, backTop=p.seatHeight+p.backHeight;
  for(const sign of [-1,1])parts.push(beam(`back-upright-${sign}`,{x:sign*(p.seatWidth/2-65),y:p.seatHeight-p.seatThickness,z:backZ},{x:sign*(p.seatWidth/2-65),y:backTop-18,z:backZ+55},16));
  const count=p.backStyle==='solid'?1:p.backStyle==='three-slat'?3:5;
  const backHeight=p.backHeight*.55;
  for(let i=0;i<count;i++) {
    const y=backTop-backHeight/2-18+(count===1?0:(i/(count-1)-.5)*(backHeight-26));
    const z=backZ+55*(y-p.seatHeight)/(p.backHeight-18);
    parts.push(panel(`back-${i}`,p.seatWidth-40,14,count===1?backHeight:26,{x:0,y,z:z-10},'roundover',count===1?32:8,{x:Math.PI/2+.13,y:0,z:0}));
  }
  return bounds(parts);
}
export function generateChairBOM(p: ChairParams): BOMResult {
  return collectionBOM(generateChairGeometry(p),p.woodSpecies,24,9);
}

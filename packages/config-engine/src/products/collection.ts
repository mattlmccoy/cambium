/** Shared, framework-free construction vocabulary for the revised collection.
 * Tube joints and machining allowances are prototype assumptions, not load ratings.
 */
import type { BOMResult, EdgeProfile, GeometryPart, GeometryResult, Vec3 } from '@cambium/shared';
import { boxPart, lineItem, panelItem } from './shared';

const origin = { x: 0, y: 0, z: 0 };
export function panel(id: string, width: number, height: number, depth: number, position: Vec3,
  edge: EdgeProfile = 'roundover', cornerRadius = 24, rotation = origin, ellipse = false, scoop = 0): GeometryPart {
  return { ...boxPart(id, id.replaceAll('-', ' '), 'panel', 'wood', position, { x: width, y: height, z: depth }, rotation),
    shape: { kind: 'profile-panel', width, height, depth, cornerRadius, edge, ellipse, scoop } };
}
export function tube(id: string, width: number, height: number, depth: number, position: Vec3, rotation = origin): GeometryPart {
  return { ...boxPart(id, id.replaceAll('-', ' '), 'rod', 'metal', position, { x: width, y: height, z: depth }, rotation),
    shape: { kind: 'tube', width, height, depth, wall: 1.5 } };
}
/** Tube length is its local Y axis. */
export function beam(id: string, from: Vec3, to: Vec3, size = 20): GeometryPart {
  const dx = to.x-from.x, dy = to.y-from.y, dz = to.z-from.z;
  const length = Math.hypot(dx,dy,dz);
  // XYZ Euler maps local Y to the requested direction, including diagonal braces.
  return tube(id,size,length,size,{ x:(from.x+to.x)/2,y:(from.y+to.y)/2,z:(from.z+to.z)/2 },
    {x:Math.atan2(dz,dy),y:0,z:-Math.atan2(dx,Math.hypot(dy,dz))});
}
export function leg(parts: GeometryPart[], id: string, x: number, z: number, height: number, wrap: 'full'|'partial'|'exposed') {
  parts.push(tube(`${id}-tube`,20,height-5,20,{x,y:(height+5)/2,z}));
  parts.push(boxPart(`${id}-glide`,'Push-in glide','hardware','plastic',{x,y:2.5,z},{x:22,y:5,z:22}));
  if(wrap !== 'exposed') for(const side of (wrap==='full'?[-1,1]:[1]) as (-1|1)[]) {
    parts.push({ ...boxPart(`${id}-cover-${side}`,'Tapered routed cover','panel','wood',{x,y:height/2+2.5,z},{x:22,y:height-9,z:44}),
      shape:{kind:'wood-shell',height:height-9,topWidth:44,bottomWidth:36,channel:22,side} });
  }
}
export function bounds(parts: GeometryPart[]): GeometryResult {
  const min = {x:Infinity,y:Infinity,z:Infinity}, max={x:-Infinity,y:-Infinity,z:-Infinity};
  for(const p of parts) {
    // Conservative rotation-aware box, also used to frame tall/tilted products.
    const {x:a,y:b,z:c}=p.rotation;
    const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cc=Math.cos(c),sc=Math.sin(c);
    const m=[[cb*cc,-cb*sc,sb],[sa*sb*cc+ca*sc,-sa*sb*sc+ca*cc,-sa*cb],[-ca*sb*cc+sa*sc,ca*sb*sc+sa*cc,ca*cb]];
    const d=p.shape.kind==='wood-shell'?[p.shape.topWidth,p.dimensions.y,p.shape.topWidth]:[p.dimensions.x,p.dimensions.y,p.dimensions.z];
    for(const [i,axis] of (['x','y','z'] as const).entries()) {
      const extent=m[i].reduce((v,n,j)=>v+Math.abs(n)*d[j]/2,0);
      min[axis]=Math.min(min[axis],p.position[axis]-extent); max[axis]=Math.max(max[axis],p.position[axis]+extent);
    }
  }
  return {parts,boundingBox:{min,max}};
}
/** One source of part quantities and wood blank dimensions for all product options. */
export function collectionBOM(geometry: GeometryResult, species: string, fasteners: number, packaging: number): BOMResult {
  const items=geometry.parts.map(p=>{
    if(p.material==='wood') {
      const d=p.dimensions;
      const [length,width,thickness]=[d.x,d.y,d.z].sort((a,b)=>b-a);
      return panelItem(p.id,p.name,species,1,length,width,thickness);
    }
    if(p.shape.kind==='tube') return lineItem(p.id,p.name,'core','powder-coated steel tube',1);
    return lineItem(p.id,p.name,'hardware',p.material,1,p.material==='plastic'?.35:.65);
  });
  items.push(lineItem('fastener-kit','Bolts, inserts and movement-compatible top fixings','hardware','steel',fasteners,.22),
    lineItem('packaging','Flat-pack protection allowance','packaging','corrugated',1,packaging));
  return {items,totalBoardFeet:items.reduce((s,p)=>s+(p.boardFeet??0),0),
    totalRodMm:geometry.parts.reduce((s,p)=>s+(p.shape.kind==='tube'?p.shape.height:0),0)};
}
export function tableFrame(width:number,depth:number,height:number,thickness:number,wrap:'full'|'partial'|'exposed',three=false,ellipse=false,covers=false): GeometryPart[] {
  const parts:GeometryPart[]=[];
  // Elliptical/racetrack tops need their supports pulled inside the curved outline.
  const x=width/2-(ellipse?width*.22:65), z=depth/2-(ellipse?depth*.22:65), h=height-thickness;
  const positions=three?[{x:0,z:-z},{x:-x,z:z*.55},{x:x,z:z*.55}]:[{x:-x,z:-z},{x:x,z:-z},{x:x,z:z},{x:-x,z:z}];
  positions.forEach((p,i)=>leg(parts,`leg-${i}`,p.x,p.z,h,wrap));
  // Three legs get a triangular frame; four legs use two welded ends + two bolt-on rails.
  positions.forEach((p,i)=>{
    const next=positions[(i+1)%positions.length];
    parts.push(beam(`frame-${i}`,{...p,y:h-15},{...next,y:h-15},20));
    if(covers){
      const dx=next.x-p.x,dz=next.z-p.z,length=Math.hypot(dx,dz);
      parts.push(panel(`apron-cover-${i}`,Math.max(20,length-44),28,8,
        {x:(p.x+next.x)/2+dz/length*14,y:h-15,z:(p.z+next.z)/2-dx/length*14},
        'roundover',2,{x:0,y:-Math.atan2(dz,dx),z:0}));
    }
  });
  if(width>1200)parts.push(beam('center-brace',{x:0,y:h-15,z:-z},{x:0,y:h-15,z:z}));
  return parts;
}

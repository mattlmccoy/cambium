'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GeometryPart } from '@cambium/shared';

function outline(w:number,d:number,r:number,ellipse=false): THREE.Shape {
  const s=new THREE.Shape();
  if(ellipse){s.absellipse(0,0,w/2,d/2,0,Math.PI*2,false,0);return s;}
  r=Math.max(.01,Math.min(r,w/2-.01,d/2-.01));
  const x=w/2,y=d/2;
  s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);
  s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);s.lineTo(-x+r,y);
  s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);
  return s;
}
export function makeProfileGeometry(part:GeometryPart): THREE.BufferGeometry {
  const s=part.shape;
  if(s.kind==='wood-shell') {
    // Half of a tapered rectangular sleeve. The open channel is routed flat before assembly.
    const ring=(r:number)=>[[0,-r],[r,-r],[r,r],[0,r],[0,s.channel/2],[s.channel/2,s.channel/2],[s.channel/2,-s.channel/2],[0,-s.channel/2]];
    const bottom=ring(s.bottomWidth/2),top=ring(s.topWidth/2);
    const positions:number[]=[];const indices:number[]=[];
    for(const [j,points] of [bottom,top].entries())for(const [x,z] of points)positions.push(x*s.side,(j-.5)*s.height,z);
    const triangles=THREE.ShapeUtils.triangulateShape(top.map(([x,z])=>new THREE.Vector2(x,z)),[]);
    for(const [a,b,c] of triangles){indices.push(a,b,c,8+c,8+b,8+a);}
    for(let i=0;i<8;i++){const j=(i+1)%8;indices.push(i,8+i,8+j,i,8+j,j);}
    if(s.side<0)for(let i=0;i<indices.length;i+=3)[indices[i],indices[i+2]]=[indices[i+2],indices[i]];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);const flat=g.toNonIndexed();flat.computeVertexNormals();g.dispose();return flat;
  }
  if(s.kind==='tube') {
    const shape=outline(s.width,s.depth,1);
    const hole=new THREE.Path();const x=s.width/2-s.wall,z=s.depth/2-s.wall;
    hole.moveTo(-x,-z);hole.lineTo(-x,z);hole.lineTo(x,z);hole.lineTo(x,-z);hole.closePath();shape.holes.push(hole);
    const g=new THREE.ExtrudeGeometry(shape,{depth:s.height,bevelEnabled:false,curveSegments:4});
    g.rotateX(-Math.PI/2);g.translate(0,-s.height/2,0);return g;
  }
  if(s.kind==='profile-panel') {
    const bevel=s.edge==='square'?0:s.edge==='roundover'?Math.min(3,s.height/5):s.edge==='bevel'?Math.min(6,s.height/3):Math.min(2,s.height/5);
    const shape=outline(s.width-2*bevel,s.depth-2*bevel,Math.max(.01,s.cornerRadius-bevel),s.ellipse);
    for(const h of s.holes??[]) {
      const hole=new THREE.Path(),x=h.x,z=-h.z,w=h.width/2+bevel,d=h.depth/2+bevel;
      hole.moveTo(x-w,z-d);hole.lineTo(x-w,z+d);hole.lineTo(x+w,z+d);hole.lineTo(x+w,z-d);hole.closePath();shape.holes.push(hole);
    }
    const g=new THREE.ExtrudeGeometry(shape,{depth:s.height-2*bevel,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:s.edge==='roundover'?5:1,curveSegments:32,steps:1});
    g.rotateX(-Math.PI/2);g.translate(0,-s.height/2+bevel,0);
    if(s.scoop) {
      // Subdivide cap triangles before displacing them into the shallow seat scoop.
      const flat=g.index?g.toNonIndexed():g.clone(); const pos=flat.getAttribute('position');
      // Subdivide each triangle so broad cap faces can represent a smooth scoop.
      const verts:number[]=[];
      const push=(v:THREE.Vector3)=>{if(v.y>s.height/2-.01){const nx=v.x/(s.width/2),nz=v.z/(s.depth/2);v.y-=s.scoop!*Math.max(0,1-nx*nx)**2*Math.max(0,1-nz*nz)**2;}verts.push(v.x,v.y,v.z);};
      const subdivide=(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Vector3,n:number)=>{
        if(!n){push(a.clone());push(b.clone());push(c.clone());return;}
        const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
        subdivide(a,ab,ca,n-1);subdivide(ab,b,bc,n-1);subdivide(ca,bc,c,n-1);subdivide(ab,bc,ca,n-1);
      };
      for(let i=0;i<pos.count;i+=3)subdivide(new THREE.Vector3().fromBufferAttribute(pos,i),new THREE.Vector3().fromBufferAttribute(pos,i+1),new THREE.Vector3().fromBufferAttribute(pos,i+2),3);
      const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));result.computeVertexNormals();flat.dispose();g.dispose();return result;
    }
    return g;
  }
  throw new Error(`Unsupported profile ${s.kind}`);
}

export function ProfileMesh({part,color,roughness=.55}:{part:GeometryPart;color:string;roughness?:number}) {
  const geometry=useMemo(()=>makeProfileGeometry(part),[part]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} position={[part.position.x,part.position.y,part.position.z]} rotation={[part.rotation.x,part.rotation.y,part.rotation.z]} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={part.material==='metal'?.38:roughness} metalness={part.material==='metal'?.55:0} side={THREE.DoubleSide} />
  </mesh>;
}

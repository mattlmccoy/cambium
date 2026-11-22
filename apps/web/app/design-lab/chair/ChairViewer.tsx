'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { Bounds, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
const gallery = [
 { id: 'hero', label: 'Product', model: 'covered' },
 { id: 'detail', label: 'Detail', model: 'covered' },
 { id: 'room', label: 'In a room', model: 'covered' },
 { id: 'rear', label: 'Rear', model: 'rear' },
 { id: 'exploded', label: 'Inside', model: 'exploded' },
] as const;
function Model({ view, revision = 'chair-06' }: { view: string; revision?: string }) {
  const { scene } = useGLTF(`${assetBase}/models/${revision}/${view}.glb`);
  const { model, materials } = useMemo(() => {
    const result = scene.clone(true);
    const wood = new MeshStandardMaterial({ color: '#b9956b', roughness: .55 });
    const steel = new MeshStandardMaterial({ color: '#3b423d', roughness: .45, metalness: .2 });
    const polymer = new MeshStandardMaterial({ color: '#555a52', roughness: .7 });
    result.traverse(object => {
      if (object instanceof Mesh) {
        const source = Array.isArray(object.material) ? object.material[0] : object.material;
        object.material = source.name.includes('hardwood') ? wood : source.name === 'Polymer' ? polymer : steel;
      }
    });
    return { model: result, materials: [wood, steel, polymer] };
  }, [scene]);
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials]);
  return <primitive object={model} />;
}
export default function ChairViewer() {
 const [currentView, setCurrentView] = useState('hero');
 const [resetView, setResetView] = useState(0);
 const selected = gallery.find(item => item.id === currentView)!;
 const [currentInteractive, setCurrentInteractive] = useState(false);
 return <main className="min-h-screen bg-[#f1eee7] text-stone-900">
  <header className="flex items-center justify-between border-b border-stone-300 px-5 py-5 md:px-10"><Link href="/" className="tracking-[.18em]">CAMBIUM</Link><span className="text-xs uppercase tracking-widest">The chair</span></header>
  <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_330px]" aria-label="Concealed-frame chair study">
   <div><div className="aspect-square overflow-hidden rounded-2xl bg-[#e9e5dc]">{currentInteractive ? <Canvas key={`${currentView}-${resetView}`} camera={{ position: currentView === 'rear' ? [-1.3, .9, -1.6] : [1.3, .9, 1.6], fov: 40 }}><ambientLight intensity={1.4}/><directionalLight position={[3,5,2]} intensity={2.2}/><Suspense fallback={<Html center>Loading CAD…</Html>}><Bounds key={currentView} fit clip observe margin={1.2}><Model revision="chair-06" view={selected.model}/></Bounds></Suspense><OrbitControls makeDefault/></Canvas> : <img src={currentView === 'exploded' ? `${assetBase}/images/chair-06/exploded.png` : `${assetBase}/images/chair-07/${currentView}.jpg`} alt={`Concealed hardwood chair: ${currentView}`} width={1200} height={1200} className="h-full w-full object-contain"/>}</div>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Current chair views">{gallery.map(item=><button type="button" key={item.id} aria-pressed={currentView===item.id} onClick={()=>setCurrentView(item.id)} className={`rounded-full border px-4 py-2 text-sm ${currentView===item.id?'bg-stone-900 text-white':'border-stone-400'}`}>{item.label}</button>)}<button type="button" aria-pressed={currentInteractive} onClick={()=>setCurrentInteractive(!currentInteractive)} className="rounded-full border border-stone-400 px-4 py-2 text-sm">{currentInteractive?'Product image':'Explore in 3D'}</button>{currentInteractive && <button type="button" onClick={()=>setResetView(value=>value+1)} className="rounded-full border border-stone-400 px-4 py-2 text-sm">Reset view</button>}</div>
    <p className="mt-3 text-sm text-stone-600">{currentView==='exploded'?'Wood elements separated to reveal the steel structure. Illustrative offsets; attachment details are still being developed.':currentInteractive ? 'Drag to rotate. Pinch or scroll to zoom. The 3D view uses simplified materials.' : 'CAD product rendering. Wood grain and color are illustrative; physical sample photography will follow.'}</p>
   </div>
   <aside className="space-y-6 lg:pt-10"><p className="text-sm uppercase tracking-widest text-stone-500">In development</p><h1 className="font-display text-5xl">The chair.</h1><p className="text-lg leading-relaxed text-stone-600">Hardwood seat, back and leg covers over a steel frame.</p><p className="leading-relaxed text-stone-600">We are testing the design of the back, seat and wood-to-frame connections before production.</p><dl className="space-y-3 border-y border-stone-300 py-5"><div><dt className="text-sm text-stone-500">Seat height</dt><dd>450 mm</dd></div><div><dt className="text-sm text-stone-500">Seat footprint</dt><dd>460 × 440 mm</dd></div><div><dt className="text-sm text-stone-500">Availability</dt><dd>In development · not for sale</dd></div></dl><p className="text-sm text-stone-500">Strength, comfort, production cost and revised flat packing are not yet validated.</p></aside>
  </section>
  <details className="mx-auto max-w-7xl border-t border-stone-300 px-5 py-8"><summary className="cursor-pointer text-lg">Assembly &amp; delivery concept</summary><p className="mt-4 max-w-2xl leading-relaxed text-stone-600">Six proposed factory-finished components. The sleeves arrive assembled around the frame. Final fasteners, packaging protection and shipping dimensions are still being developed.</p><div className="mt-6 grid gap-5 md:grid-cols-2"><figure><img src={`${assetBase}/images/chair-07/components.jpg`} alt="Six proposed factory assemblies separated to show how the chair fits together" width={1400} height={1400} loading="lazy" className="rounded-xl"/><figcaption className="mt-3 text-sm text-stone-600">Two sides, two rails, seat and back. Attachment details are not yet released.</figcaption></figure><figure><img src={`${assetBase}/images/chair-07/box.jpg`} alt="Cambium branded kraft carton concept" width={1400} height={1400} loading="lazy" className="rounded-xl"/><figcaption className="mt-3 text-sm text-stone-600">Packaging concept. Carton and shipping protection require physical testing.</figcaption></figure></div></details>
 </main>;
}

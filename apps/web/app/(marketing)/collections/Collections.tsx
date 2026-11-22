'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';
import { Bounds, Html, OrbitControls, useGLTF } from '@react-three/drei';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const drops = [
  { id: 'still', name: 'Still', description: 'Mid-century proportions, rounded wood edges and covered legs.' },
  { id: 'arc', name: 'Arc', description: 'Larger curves, a rounded back and thicker wood covers.' },
  { id: 'line', name: 'Line', description: 'Exposed graphite steel, thin wood surfaces and square edges.' },
] as const;
const products = [
  { id: 'chair', name: 'Chair', dimensions: '460 × 440 mm seat · 450 mm seat height', module: 'Seat and back', mount: 'Four M6 seat mounts and four rear-access back mounts. Replacement modules retain the mount coordinates for this chair frame.' },
  { id: 'side-table', name: 'Side table', dimensions: '520 × 460 × 500 mm', module: 'Top', mount: 'Four underside M6 mounts. A fixed datum locates the top; the remaining connections allow movement across the grain.' },
  { id: 'coffee-table', name: 'Coffee table', dimensions: '1100 × 600 × 380 mm', module: 'Top', mount: 'Four underside M6 mounts, with slots across the grain. Replacement tops must fit this frame’s footprint and fixing pattern.' },
  { id: 'dining-table', name: 'Dining table', dimensions: '1600 × 850 × 750 mm', module: 'Top', mount: 'Six underside M6 mounts and deeper cross rails. The larger top needs its own movement allowance and load tests.' },
  { id: 'shelf', name: 'Shelving', dimensions: '800 × 320 × 1102 mm', module: 'Individual shelves', mount: 'Each shelf unbolts separately. The frame remains assembled. Wall restraint, racking resistance and load ratings still require development.' },
] as const;
const connectors = [
  { id: 'sleeve-coupon', name: 'Joined wood sleeve', copy: 'Four matched strips form a continuous exterior around the frame. The cavity is formed during glue-up. Explode the 3D view to see the mitered strips.' },
  { id: 'guide-liner', name: 'Sleeve guide', copy: 'Two identical L-shaped guides center a wood sleeve on a 25 mm tube. The wood is retained mechanically underneath; the guides control fit and rattle.' },
  { id: 'mount-carrier', name: 'Captive mount carrier', copy: 'A polymer carrier keeps the steel washer with the mounting hardware. The steel spacer and washer carry the clamp load. The same stack can serve tops, seats, backs and shelves.' },
  { id: 'rail-locator', name: 'Rail alignment guide', copy: 'Paired edge guides locate a rail foot during assembly. Steel bears on steel and M6 bolts retain the joint. These are coupon parts; fit to the complete frame still needs checking.' },
] as const;
type Drop = typeof drops[number]['id'];
type Product = typeof products[number]['id'];
function Model({ id, exploded }: { id: string; exploded: boolean }) {
  const { scene } = useGLTF(`${base}/models/collections-09/${id}/${exploded ? 'exploded' : 'model'}.glb`);
  const { model, materials } = useMemo(() => {
    const copy = scene.clone(true);
    const wood = new MeshStandardMaterial({ color: id.startsWith('arc') ? '#d3bd98' : id.startsWith('standard') ? '#d8bd90' : '#b9956b', roughness: .55 });
    const steel = new MeshStandardMaterial({ color: '#3b443e', roughness: .45, metalness: .4 });
    const fabric = new MeshStandardMaterial({ color: '#718168', roughness: .9 });
    const polymer = new MeshStandardMaterial({ color: ['guide-liner','mount-carrier','rail-locator'].includes(id) ? '#52755d' : '#41473f', roughness: .65 });
    copy.traverse(object => {
      if (object instanceof Mesh) {
        const material = Array.isArray(object.material) ? object.material[0] : object.material;
        object.material = material.name.startsWith('hardwood') ? wood : material.name === 'Fabric' ? fabric : material.name === 'polymer' ? polymer : steel;
      }
    });
    return { model: copy, materials: [wood, steel, fabric, polymer] };
  }, [scene, id]);
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials]);
  return <primitive object={model} />;
}

function MountDrawing({ kind }: { kind: 'surface' | 'cover' | 'upholstery' | 'wood' }) {
  const wood = '#c6a47b'; const steel = '#3b443e'; const accent = '#52755d';
  return <svg viewBox="0 0 440 260" role="img" aria-label={`${kind} attachment section, schematic, not to scale`} className="w-full rounded-xl bg-[#edeae2]">
    {kind === 'surface' ? <>
      <rect x="60" y="38" width="320" height="58" rx="4" fill={wood}/><rect x="207" y="62" width="26" height="34" fill="#987b4d"/>
      <rect x="78" y="121" width="129" height="13" fill={steel}/><rect x="233" y="121" width="129" height="13" fill={steel}/>
      <rect x="207" y="96" width="8" height="48" fill="#949d96"/><rect x="225" y="96" width="8" height="48" fill="#949d96"/>
      <rect x="187" y="144" width="66" height="10" fill={steel}/><rect x="216" y="73" width="8" height="95" fill={steel}/><rect x="202" y="164" width="36" height="12" rx="3" fill={steel}/>
      <path d="M90 192h80m-80 0 10-6m-10 6 10 6m70-6-10-6m10 6-10 6" stroke={accent} strokeWidth="2" fill="none"/>
      <text x="60" y="229" fontSize="13" fill={steel}>Insert · spacer · slotted tab · washer · M6 bolt</text>
    </> : kind === 'cover' ? <>
      <rect x="130" y="36" width="30" height="157" fill={wood}/><rect x="280" y="36" width="30" height="157" fill={wood}/>
      <rect x="179" y="29" width="82" height="164" fill="none" stroke={steel} strokeWidth="10"/>
      <rect x="138" y="208" width="164" height="9" rx="3" fill={steel}/><path d="M220 202v31" stroke={steel} strokeWidth="5"/>
      <path d="M345 75v95m-7-10 7 10 7-10" stroke={accent} strokeWidth="2" fill="none"/>
      <text x="31" y="248" fontSize="13" fill={steel}>Factory-joined sleeve; removable keeper underneath</text>
    </> : kind === 'upholstery' ? <>
      <rect x="65" y="45" width="310" height="66" rx="22" fill="#70816d"/><path d="M85 64h270" stroke="#a4ad9e" strokeDasharray="4 4" fill="none"/>
      <rect x="70" y="113" width="300" height="19" fill={wood}/><rect x="70" y="152" width="300" height="12" fill={steel}/>
      {[130,310].map(x=><g key={x}><rect x={x-12} y="111" width="24" height="5" fill={steel}/><path d={`M${x} 113v72`} stroke={steel} strokeWidth="6"/><rect x={x-11} y="182" width="22" height="8" fill={steel}/></g>)}
      <text x="50" y="232" fontSize="13" fill={steel}>Sewn cover + foam + carrier; same frame mounts</text>
    </> : <>
      <rect x="65" y="40" width="65" height="175" fill={wood}/><rect x="150" y="77" width="225" height="95" fill={wood}/>
      <circle cx="280" cy="125" r="18" fill={steel}/><path d="M45 125h253" stroke={steel} strokeWidth="6"/>
      <path d="M113 97h61m-61 55h61" stroke="#8d6a44" strokeWidth="10"/><rect x="34" y="114" width="12" height="22" rx="3" fill={steel}/>
      <text x="50" y="244" fontSize="13" fill={steel}>Locating dowels + M6 bolt + cross dowel</text>
    </>}
  </svg>;
}

export default function Collections() {
  const [drop, setDrop] = useState<Drop>('still');
  const [product, setProduct] = useState<Product>('chair');
  const [interactive, setInteractive] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [upholstered, setUpholstered] = useState(false);
  const [woodFrame, setWoodFrame] = useState(false);
  const [reset, setReset] = useState(0);
  const [connector, setConnector] = useState<string>('guide-liner');
  const [connector3D, setConnector3D] = useState(false);
  const [connectorExploded, setConnectorExploded] = useState(false);
  useEffect(() => { const hash = window.location.hash.slice(1); if (drops.some(d => d.id === hash)) setDrop(hash as Drop); const requested = new URLSearchParams(window.location.search).get('product'); if (products.some(p => p.id === requested)) setProduct(requested as Product); }, []);
  const selectedDrop = drops.find(d => d.id === drop)!;
  const selectedProduct = products.find(p => p.id === product)!;
  const id = `${woodFrame ? 'standard' : drop}-${product}${upholstered && product === 'chair' && !woodFrame ? '-upholstered' : ''}`;
  function chooseProduct(p: Product) { setProduct(p); setUpholstered(false); if (p === 'shelf') setWoodFrame(false); }
  return <main className="bg-[#f3f0e9] text-[#293b31]">
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 md:px-10">
      <p className="mb-4 text-xs uppercase tracking-[.18em] text-stone-500">Collections in development</p>
      <h1 className="font-display text-5xl md:text-7xl">Still. Arc. Line.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">Three collections built around replaceable wood surfaces. Keep the frame when a top, seat or back needs changing.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3" role="group" aria-label="Collection">
        {drops.map(d => <button key={d.id} type="button" aria-pressed={drop === d.id && !woodFrame} onClick={() => { setDrop(d.id); setWoodFrame(false); }} className={`rounded-2xl border p-5 text-left ${drop === d.id && !woodFrame ? 'border-[#293b31] bg-[#293b31] text-white' : 'border-stone-300'}`}><span className="font-display text-3xl">{d.name}</span><span className="mt-2 block text-sm leading-relaxed opacity-80">{d.description}</span></button>)}
      </div>
    </section>
    <section id="collection-product" className="mx-auto max-w-7xl px-5 pb-14 md:px-10">
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Furniture type">{products.map(p => <button key={p.id} type="button" aria-pressed={product === p.id} onClick={() => chooseProduct(p.id)} className={`rounded-full border px-4 py-2 text-sm ${product === p.id ? 'border-stone-800 bg-white' : 'border-transparent text-stone-500'}`}>{p.name}</button>)}</div>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="aspect-[11/10] overflow-hidden rounded-2xl bg-[#e8e5de]">{interactive ? <Canvas key={`${id}-${exploded}-${reset}`} camera={{position:[1.8,1.2,2],fov:40}}><ambientLight intensity={1.3}/><directionalLight position={[3,5,2]} intensity={2.5}/><Suspense fallback={<Html center>Loading 3D…</Html>}><Bounds fit clip observe margin={1.25}><Model id={id} exploded={exploded}/></Bounds></Suspense><OrbitControls makeDefault/></Canvas> : <img src={`${base}/images/collections-09/${id}.jpg`} alt={`${woodFrame ? 'Standard wood-frame' : selectedDrop.name} ${selectedProduct.name.toLowerCase()}${upholstered ? ' with proposed upholstery modules' : ''}, CAD rendering`} width={1100} height={1000} className="h-full w-full object-contain"/>}</div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setInteractive(v => !v)} className="rounded-full bg-[#293b31] px-5 py-2.5 text-sm text-white">{interactive ? 'Product image' : 'View in 3D'}</button>{interactive && <><button type="button" aria-pressed={exploded} onClick={() => setExploded(v => !v)} className="rounded-full border border-stone-400 px-4 py-2 text-sm">{exploded ? 'Assembled view' : 'Exploded view'}</button><button type="button" onClick={() => setReset(v => v+1)} className="rounded-full border border-stone-400 px-4 py-2 text-sm">Reset view</button></>}{product === 'chair' && !woodFrame && <button type="button" aria-pressed={upholstered} onClick={() => setUpholstered(v => !v)} className="rounded-full border border-stone-400 px-4 py-2 text-sm">{upholstered ? 'Wood seat & back' : 'Preview upholstery'}</button>}</div>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">CAD rendering. Colors and grain are illustrative. {interactive ? 'Drag to rotate; scroll or pinch to zoom. 3D materials are simplified. Exploded offsets show component groups, not assembly instructions.' : 'These designs have not been physically tested.'}</p>
        </div>
        <aside className="space-y-6 lg:pt-6">
          <div><p className="text-xs uppercase tracking-widest text-stone-500">{woodFrame ? 'Wood-frame comparison' : 'Proposed drop'}</p><h2 className="mt-3 font-display text-4xl">{woodFrame ? 'Standard' : selectedDrop.name} {selectedProduct.name.toLowerCase()}</h2></div>
          <dl className="space-y-4 border-y border-stone-300 py-5"><div><dt className="text-xs text-stone-500">Dimensions</dt><dd className="mt-1 text-sm">{upholstered && !woodFrame && product === 'chair' ? '500 × 480 mm seat carrier · 460 mm upholstered seat height' : product === 'chair' && drop === 'arc' && !woodFrame ? '520 × 500 mm seat · 450 mm seat height' : selectedProduct.dimensions}</dd></div><div><dt className="text-xs text-stone-500">Replaceable parts</dt><dd className="mt-1">{selectedProduct.module}{!woodFrame && drop !== 'line' ? ', leg covers' : ''}</dd></div><div><dt className="text-xs text-stone-500">Availability</dt><dd className="mt-1">In development. Not for sale.</dd></div></dl>
          <p className="text-sm leading-relaxed text-stone-600">{selectedProduct.mount}</p>
          {upholstered && <p className="text-sm leading-relaxed text-stone-600">The future upholstery kit replaces the wood seat and back with padded carriers. It raises the seat by 10 mm and changes the seat footprint. Foam, fabric and comfort need testing.</p>}
          {woodFrame && <p className="text-sm leading-relaxed text-stone-600">Solid-wood legs and rails, factory-glued end assemblies and bolted cross rails. This removes the steel frame and wood covers. Cost and joint performance still need comparison in the shop.</p>}
          <p className="text-xs leading-relaxed text-stone-500">Mounts are a proposed V1 interface. Compatibility applies only to the matching product and interface revision; earlier prototypes are not included. Price follows prototype tests and supplier quotes.</p>
        </aside>
      </div>
    </section>
    <section className="border-y border-stone-300 bg-[#e8e9df] px-5 py-12 md:px-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2"><div><p className="text-xs uppercase tracking-widest">Replacement parts</p><h2 className="mt-3 font-display text-4xl">Keep the frame.</h2><p className="mt-4 max-w-xl leading-relaxed text-stone-600">A different wood top, a replacement seat or an upholstered back should fit the frame you already own. Each module will carry its product name and interface revision so the matching parts are clear.</p></div><div className="space-y-4 text-sm leading-relaxed"><p>Tables: replace the top using bolts accessed from below.</p><p>Chairs: replace the seat and back separately. Upholstery arrives on its own carrier; no sewing or stapling at home.</p><p>Shelving: replace one shelf at a time. Wall restraints remain separate from shelf attachment.</p><p>Still and Arc: removable wood covers. Line frames include the same foot anchors and sleeve stops for a later cover kit.</p></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-10"><details><summary className="cursor-pointer font-display text-3xl">How the parts attach</summary><p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-600">Proposed connections for prototype review. Nominal holes, fasteners and access openings are modeled; species-specific insert selection, tolerance stacks, repeated assembly and load tests remain open.</p><div className="mt-6 grid gap-7 md:grid-cols-2">{([
      ['surface','Tops, seats and shelves','M6 bolts engage factory-installed inserts. Separate bearing pads carry the surface load. A spacer limits clamping at the steel tab so its slot can accommodate wood movement. Slot travel must be checked for each species and panel width.'],
      ['cover','Wood covers','Matched strips are joined at the factory into a continuous sleeve. Lower sleeves slide off after the foot keeper is removed. Upper chair sleeves lift off after removing the back and its bolted cleats. There are no exposed cover screws. Service access still needs physical testing.'],
      ['upholstery','Upholstery modules','Foam and a sewn cover fit over a plywood carrier. Captured T-nuts retain the module on the existing bolt pattern. The carrier, foam thickness and fabric construction still need qualification.'],
      ['wood','Wood-frame alternative','Factory-glued end assemblies connect through removable cross rails. Dowels locate each rail; M6 bolts engage cross dowels. Strength depends on the wood grade and tested joint dimensions.'],
    ] as const).map(([kind,title,copy]) => <article key={kind}><MountDrawing kind={kind}/><h3 className="mt-4 text-lg">{title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">{copy}</p></article>)}</div></details></section>
    <section className="border-t border-stone-300 px-5 py-12 md:px-10"><div className="mx-auto max-w-7xl"><p className="text-xs uppercase tracking-widest text-stone-500">Shared parts</p><h2 className="mt-3 font-display text-3xl">Connectors across the collection</h2><p className="mt-4 max-w-2xl leading-relaxed text-stone-600">Small printed parts can help locate, retain and align the assemblies. We plan to test SLS prototypes before deciding which parts justify injection molds. Structural loads remain on the metal or wood joints.</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{connectors.map(c=><button type="button" key={c.id} aria-pressed={connector===c.id} onClick={()=>setConnector(c.id)} className={`rounded-xl border p-4 text-left ${connector===c.id?'border-[#293b31] bg-white':'border-stone-300'}`}><span className="block text-lg">{c.name}</span><span className="mt-2 block text-sm leading-relaxed text-stone-600">{c.copy}</span></button>)}</div><div className="mt-6 grid items-center gap-6 md:grid-cols-2"><div className="aspect-[11/10] overflow-hidden rounded-xl bg-[#e8e5de]">{connector3D?<Canvas key={`${connector}-${connectorExploded}`} camera={{position:[.12,.10,.16],fov:40,near:.001}}><ambientLight intensity={1.4}/><directionalLight position={[1,2,1]} intensity={2}/><Suspense fallback={<Html center>Loading connector…</Html>}><Bounds fit clip observe margin={1.3}><Model id={connector} exploded={connectorExploded}/></Bounds></Suspense><OrbitControls makeDefault/></Canvas>:<img src={`${base}/images/collections-09/${connector}.jpg`} width={1100} height={1000} alt={`${connectors.find(c=>c.id===connector)?.name}, prototype CAD`} className="h-full w-full object-contain"/>}</div><div><button type="button" onClick={()=>setConnector3D(v=>!v)} className="rounded-full bg-[#293b31] px-5 py-3 text-sm text-white">{connector3D?'Part image':'Inspect part in 3D'}</button>{connector3D && <button type="button" onClick={()=>setConnectorExploded(v=>!v)} className="ml-2 mt-2 rounded-full border border-stone-400 px-5 py-3 text-sm">{connectorExploded?'Assembled parts':'Explode parts'}</button>}<p className="mt-5 max-w-md text-sm leading-relaxed text-stone-600">These are connector coupons, not released production parts. Printed and molded materials need separate fit, wear and creep tests. Mold draft, shrinkage and tooling have not been resolved.</p></div></div></div></section>
    <section className="mx-auto max-w-7xl border-t border-stone-300 px-5 py-12 md:px-10"><h2 className="font-display text-3xl">Could a wood frame cost less?</h2><p className="mt-4 max-w-2xl leading-relaxed text-stone-600">We are comparing a simpler solid-wood frame against the steel versions. It eliminates welding, coating and leg covers, but adds wood joints and assembly fixtures. We will compare the cost per accepted finished part.</p><button type="button" onClick={() => { if(product==='shelf') setProduct('chair'); setWoodFrame(v=>!v); setUpholstered(false); document.getElementById('collection-product')?.scrollIntoView({behavior:'smooth'}); }} aria-pressed={woodFrame} className="mt-5 rounded-full border border-stone-500 px-5 py-3 text-sm">{woodFrame ? 'Return to collection frame' : 'Show wood-frame comparison above'}</button><p className="mt-4 text-xs text-stone-500">Working name: Standard. One wood, one finish, fixed sizes. No retail price has been set.</p></section>
    <footer className="border-t border-stone-300 px-5 py-8 text-center"><Link href="/" className="text-sm underline underline-offset-4">Back to the shop</Link></footer>
  </main>;
}

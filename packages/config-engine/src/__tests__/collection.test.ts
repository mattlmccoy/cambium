import { describe, expect, it } from 'vitest';
import { computeConfiguration } from '../engine';
import { PRODUCT_ORDER, SIDE_TABLE_DEFAULTS, TABLE_DEFAULTS, CHAIR_DEFAULTS, SHELF_DEFAULTS } from '@cambium/shared';

describe('revised collection compatibility',()=>{
  for(const product of PRODUCT_ORDER)it(`${product.slug}: every modeled wood blank appears in the BOM`,()=>{
    const r=computeConfiguration(product.slug,product.defaults);
    expect(r.validation.valid).toBe(true);
    for(const p of r.geometry.parts.filter(p=>p.material==='wood')) {
      const item=r.bom.items.find(i=>i.partId===p.id)!;
      expect(item).toBeDefined();expect(item.quantity).toBe(1);
      expect(item.dimensions!.length*item.dimensions!.width*item.dimensions!.thickness).toBeCloseTo(p.dimensions.x*p.dimensions.y*p.dimensions.z,4);
    }
    expect(r.cost.total).toBeGreaterThan(0);
    expect(new Set(r.geometry.parts.map(p=>p.id)).size).toBe(r.geometry.parts.length);
  });
  it('preserves three legs, circular tops, partial covers, and edge profiles',()=>{
    const r=computeConfiguration('side-table',{...SIDE_TABLE_DEFAULTS,legCount:3,topProfile:'circle',legWrapStyle:'partial',topEdge:'bevel'});
    expect(r.geometry.parts.filter(p=>p.id.match(/^leg-\d-tube$/))).toHaveLength(3);
    expect(r.geometry.parts.filter(p=>p.shape.kind==='wood-shell')).toHaveLength(3);
    const shape=r.geometry.parts.find(p=>p.id==='top')!.shape;
    expect(shape).toMatchObject({kind:'profile-panel',ellipse:true,edge:'bevel',width:460,depth:460});
  });
  it('keeps coffee/dining heights and true racetrack geometry',()=>{
    const r=computeConfiguration('table',{...TABLE_DEFAULTS,tableMode:'dining',height:730,topShape:'racetrack',length:1800,apronVisibility:'visible'});
    expect(r.params.height).toBe(730);
    expect(r.geometry.parts.find(p=>p.id==='top')!.shape).toMatchObject({cornerRadius:300});
    expect(r.geometry.parts.some(p=>p.id==='center-brace')).toBe(true);
    expect(r.bom.items.filter(p=>p.partId==='top')).toHaveLength(1);
  });
  it('preserves chair slats, scoop and exposed legs',()=>{
    const r=computeConfiguration('chair',{...CHAIR_DEFAULTS,backStyle:'five-slat',seatContour:'scoop',legWrapStyle:'exposed'});
    expect(r.geometry.parts.filter(p=>/^back-\d$/.test(p.id))).toHaveLength(5);
    expect(r.geometry.parts.find(p=>p.id==='seat')!.shape).toMatchObject({scoop:5});
    expect(r.geometry.parts.some(p=>p.shape.kind==='wood-shell')).toBe(false);
  });
  it('keeps wall shelving, back panel and spacing',()=>{
    const r=computeConfiguration('shelf',{...SHELF_DEFAULTS,mountType:'wall-mount',backPanel:true,shelfCount:5});
    expect(r.geometry.parts.filter(p=>p.id.startsWith('wall-plate'))).toHaveLength(10);
    expect(r.bom.items.some(p=>p.partId==='back-panel')).toBe(true);
    expect(r.geometry.parts.find(p=>p.id==='shelf-4')!.position.y-r.geometry.parts.find(p=>p.id==='shelf-3')!.position.y).toBe(SHELF_DEFAULTS.shelfSpacing);
  });
  it('retains regional pricing and species-dependent costs',()=>{
    const local=computeConfiguration('table',{...TABLE_DEFAULTS,regionId:'minneapolis',woodSpecies:'white-oak'});
    const other=computeConfiguration('table',{...TABLE_DEFAULTS,regionId:'minneapolis',woodSpecies:'black-walnut'});
    expect(local.cost.total).not.toBe(other.cost.total);
  });
});

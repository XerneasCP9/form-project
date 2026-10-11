import {describe,it,expect} from 'vitest';
import {geography,optionsFor,postalCodesFor,changeAddress,emptyAddress,validateAddress,validPhone} from '../shared/address';
const example=geography.find(r=>r.provinceCode==='10')!;
const valid={fullName:'ผู้ทดสอบ',addressLine:'99 ถนนทดสอบ',phone:'0812345678',provinceCode:example.provinceCode,districtCode:example.districtCode,subdistrictCode:example.subdistrictCode,postalCode:example.postalCode};
describe('Thai geography and address validation',()=>{
 it('has 77 provinces and connected nonduplicate records',()=>{expect(optionsFor('provinceCode')).toHaveLength(77);expect(new Set(geography.map(r=>r.subdistrictCode+':'+r.postalCode)).size).toBe(geography.length);for(const r of geography){expect(r.districtCode.startsWith(r.provinceCode)).toBe(true);expect(r.subdistrictCode.startsWith(r.districtCode)).toBe(true);expect(r.postalCode).toMatch(/^\d{5}$/);}});
 it('filters Bangkok and another province by parent codes',()=>{for(const provinceCode of ['10','50']){const districts=optionsFor('districtCode',{provinceCode});expect(districts.length).toBeGreaterThan(0);for(const d of districts)expect(d.value.startsWith(provinceCode)).toBe(true);const subdistricts=optionsFor('subdistrictCode',{provinceCode,districtCode:districts[0].value});expect(subdistricts.length).toBeGreaterThan(0);}});
 it('resets children when parents change',()=>{expect(changeAddress(valid,'provinceCode','50')).toMatchObject({districtCode:'',subdistrictCode:'',postalCode:''});expect(changeAddress(valid,'districtCode','1002')).toMatchObject({subdistrictCode:'',postalCode:''});});
 it('fills a known postal code from subdistrict',()=>{expect(changeAddress(emptyAddress,'subdistrictCode',example.subdistrictCode).postalCode).toBe(example.postalCode);expect(postalCodesFor(example.subdistrictCode)).toContain(example.postalCode);});
 it.each(['0612345678','0812345678','0912345678'])('accepts mobile %s',phone=>expect(validPhone(phone)).toBe(true));
 it.each(['081234567','08123456789','0212345678','08123abc78','+66812345678','081234567 '])('rejects mobile %s',phone=>expect(validPhone(phone)).toBe(false));
 it('requires name and address',()=>{expect(validateAddress({...valid,fullName:''}).valid).toBe(false);expect(validateAddress({...valid,addressLine:''}).valid).toBe(false);});
 it('accepts matching names and codes and preserves phone zero',()=>{const result=validateAddress({...valid,province:example.province,district:example.district,subdistrict:example.subdistrict});expect(result.valid).toBe(true);expect(result.fields.phone).toBe('0812345678');});
 it('rejects forged geography and postal code',()=>{expect(validateAddress({...valid,provinceCode:'50'}).valid).toBe(false);expect(validateAddress({...valid,postalCode:'99999'}).valid).toBe(false);expect(validateAddress({...valid,province:'ปลอม'}).valid).toBe(false);});
});

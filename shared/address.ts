import data from './geography.json';
import meta from './geography-meta.json';
export type Geography = {provinceCode:string;province:string;districtCode:string;district:string;subdistrictCode:string;subdistrict:string;postalCode:string};
export const geography = data as Geography[];
export const dataVersion = meta.commit;
export type AddressFields = {fullName:string;addressLine:string;provinceCode:string;districtCode:string;subdistrictCode:string;postalCode:string;phone:string};
export const emptyAddress:AddressFields={fullName:'',addressLine:'',provinceCode:'',districtCode:'',subdistrictCode:'',postalCode:'',phone:''};
export const validPhone=(value:string)=>/^0[689]\d{8}$/.test(value);
export function optionsFor(field:'provinceCode'|'districtCode'|'subdistrictCode',parent:Partial<AddressFields>={}){
 const records=geography.filter(r=>(!parent.provinceCode||r.provinceCode===parent.provinceCode)&&(!parent.districtCode||r.districtCode===parent.districtCode));
 const label=field==='provinceCode'?'province':field==='districtCode'?'district':'subdistrict';
 return [...new Map(records.map(r=>[r[field],{value:r[field],label:r[label]}])).values()].sort((a,b)=>a.label.localeCompare(b.label,'th'));
}
export function postalCodesFor(code:string){return [...new Set(geography.filter(r=>r.subdistrictCode===code).map(r=>r.postalCode))].sort();}
export function changeAddress(fields:AddressFields,key:keyof AddressFields,value:string):AddressFields{
 const next={...fields,[key]:value};
 if(key==='provinceCode'){next.districtCode='';next.subdistrictCode='';next.postalCode='';}
 if(key==='districtCode'){next.subdistrictCode='';next.postalCode='';}
 if(key==='subdistrictCode'){const codes=postalCodesFor(value);next.postalCode=codes.length===1?codes[0]:'';}
 return next;
}
export function validateAddress(input:unknown){
 const b=(typeof input==='object'&&input!==null?input:{}) as Record<string,unknown>;
 const field=(key:string)=>typeof b[key]==='string'?(b[key] as string).trim():'';
 const fields:AddressFields={fullName:field('fullName'),addressLine:field('addressLine'),provinceCode:field('provinceCode'),districtCode:field('districtCode'),subdistrictCode:field('subdistrictCode'),postalCode:field('postalCode'),phone:field('phone')};
 const errors:Record<string,string>={};
 if(!fields.fullName||fields.fullName.length>200)errors.fullName='กรุณากรอกชื่อ ไม่เกิน 200 ตัวอักษร';
 if(!fields.addressLine||fields.addressLine.length>500)errors.addressLine='กรุณากรอกที่อยู่ ไม่เกิน 500 ตัวอักษร';
 if(!validPhone(fields.phone))errors.phone='กรุณากรอกมือถือ 10 หลัก ขึ้นต้น 06, 08 หรือ 09';
 const record=geography.find(r=>r.provinceCode===fields.provinceCode&&r.districtCode===fields.districtCode&&r.subdistrictCode===fields.subdistrictCode&&r.postalCode===fields.postalCode);
 if(!record)errors.geography='กรุณาเลือกจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์ที่สัมพันธ์กัน';
 if(record)for(const key of ['province','district','subdistrict'] as const)if(b[key]!==undefined&&b[key]!==record[key])errors.geography='ชื่อพื้นที่ไม่ตรงกับข้อมูลที่เลือก';
 return {valid:Object.keys(errors).length===0,errors,fields,record};
}

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const commit='b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b';
const base=`https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/${commit}`;
const file=new URL('../shared/geography.json',import.meta.url);
let records;
if(process.argv.includes('--check')) records=JSON.parse(await readFile(file,'utf8'));
else {
  const response=await fetch(`${base}/src/geography.json`);if(!response.ok)throw Error(`Download ${response.status}`);
  const source=await response.json();
  records=source.map(r=>({provinceCode:String(r.provinceCode),province:r.provinceNameTh,districtCode:String(r.districtCode),district:r.districtNameTh,subdistrictCode:String(r.subdistrictCode),subdistrict:r.subdistrictNameTh,postalCode:String(r.postalCode)}));
}
const provinces=new Map(),districts=new Map(),keys=new Set();
for(const r of records){
  if(!/^\d{2}$/.test(r.provinceCode)||!/^\d{4}$/.test(r.districtCode)||!/^\d{6}$/.test(r.subdistrictCode)||!/^\d{5}$/.test(r.postalCode))throw Error(`Invalid code ${JSON.stringify(r)}`);
  if(!r.districtCode.startsWith(r.provinceCode)||!r.subdistrictCode.startsWith(r.districtCode)||!r.province||!r.district||!r.subdistrict)throw Error('Broken parent');
  const key=r.subdistrictCode+':'+r.postalCode;if(keys.has(key))throw Error('Duplicate '+key);keys.add(key);
  if(provinces.has(r.provinceCode)&&provinces.get(r.provinceCode)!==r.province)throw Error('Province conflict');provinces.set(r.provinceCode,r.province);
  if(districts.has(r.districtCode)&&districts.get(r.districtCode)!==r.district)throw Error('District conflict');districts.set(r.districtCode,r.district);
}
if(provinces.size!==77)throw Error(`Expected 77 provinces, found ${provinces.size}`);
if(!process.argv.includes('--check')){
 await mkdir(new URL('../shared/',import.meta.url),{recursive:true});
 const text=JSON.stringify(records);await writeFile(file,text);
 const license=await fetch(`${base}/LICENSE`).then(r=>{if(!r.ok)throw Error('License download failed');return r.text();});
 await writeFile(new URL('../shared/GEOGRAPHY-LICENSE.txt',import.meta.url),license);
 await writeFile(new URL('../shared/geography-meta.json',import.meta.url),JSON.stringify({repository:'https://github.com/thailand-geography-data/thailand-geography-json',commit,sha256:createHash('sha256').update(text).digest('hex'),provinceCount:provinces.size,districtCount:districts.size,recordCount:records.length},null,2));
}
console.log(JSON.stringify({provinces:provinces.size,districts:districts.size,records:records.length,commit}));

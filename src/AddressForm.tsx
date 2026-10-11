import {useMemo,useState} from 'react';
import {changeAddress,emptyAddress,optionsFor,postalCodesFor,validateAddress,type AddressFields} from '../shared/address';
export default function AddressForm({canSubmit,onSubmit}:{canSubmit:boolean;onSubmit:(fields:AddressFields)=>Promise<void>}){
 const [fields,setFields]=useState<AddressFields>(emptyAddress),[busy,setBusy]=useState(false),[touched,setTouched]=useState(false);
 const checked=validateAddress(fields),postals=useMemo(()=>postalCodesFor(fields.subdistrictCode),[fields.subdistrictCode]);
 const provinces=useMemo(()=>optionsFor('provinceCode'),[]);
 const districts=useMemo(()=>fields.provinceCode?optionsFor('districtCode',{provinceCode:fields.provinceCode}):[],[fields.provinceCode]);
 const subdistricts=useMemo(()=>fields.districtCode?optionsFor('subdistrictCode',{provinceCode:fields.provinceCode,districtCode:fields.districtCode}):[],[fields.provinceCode,fields.districtCode]);
 const change=(key:keyof AddressFields,value:string)=>setFields(f=>changeAddress(f,key,value));
 const select=(key:'provinceCode'|'districtCode'|'subdistrictCode',label:string,disabled:boolean)=>{
  const options=key==='provinceCode'?provinces:key==='districtCode'?districts:subdistricts;
  return <label>{label} <span>*</span><select aria-label={label} value={fields[key]} required disabled={disabled||busy} onChange={e=>change(key,e.target.value)}><option value="">เลือก{label}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
 };
 return <form onSubmit={async e=>{e.preventDefault();setTouched(true);if(!checked.valid||!canSubmit||busy)return;setBusy(true);try{await onSubmit(fields);}finally{setBusy(false);}}}>
 <label>ชื่อ-นามสกุล <span>*</span><input aria-label="ชื่อ-นามสกุล" autoComplete="name" value={fields.fullName} maxLength={200} required disabled={busy} onChange={e=>change('fullName',e.target.value)}/></label>
 <label>ที่อยู่ <span>*</span><textarea aria-label="ที่อยู่" autoComplete="address-line1" placeholder="บ้านเลขที่ หมู่ อาคาร ซอย ถนน" value={fields.addressLine} maxLength={500} rows={3} required disabled={busy} onChange={e=>change('addressLine',e.target.value)}/></label>
 {select('provinceCode','จังหวัด',false)}
 <div className="grid">{select('districtCode',fields.provinceCode==='10'?'เขต':'อำเภอ',!fields.provinceCode)}{select('subdistrictCode',fields.provinceCode==='10'?'แขวง':'ตำบล',!fields.districtCode)}</div>
 <div className="grid"><label>รหัสไปรษณีย์ <span>*</span>{postals.length>1?<select aria-label="รหัสไปรษณีย์" value={fields.postalCode} required disabled={busy} onChange={e=>change('postalCode',e.target.value)}><option value="">เลือกรหัสไปรษณีย์</option>{postals.map(p=><option key={p}>{p}</option>)}</select>:<input aria-label="รหัสไปรษณีย์" value={fields.postalCode} placeholder="เติมหลังเลือกตำบล" readOnly required/>}</label>
 <label>เบอร์มือถือ <span>*</span><input aria-label="เบอร์มือถือ" type="tel" inputMode="tel" autoComplete="tel" placeholder="08XXXXXXXX" value={fields.phone} pattern="0[689][0-9]{8}" required disabled={busy} onBlur={()=>setTouched(true)} onChange={e=>change('phone',e.target.value)}/></label></div>
 {touched&&checked.errors.phone&&<p className="field-error" role="alert">{checked.errors.phone}</p>}
 <div className="privacy"><span className="lock">◈</span><p>ใช้ข้อมูลเพื่อติดต่อและตรวจสอบที่อยู่จัดส่ง<br/>กรุณาตรวจสอบก่อนส่งค่ะ</p></div>
 <button type="submit" disabled={!canSubmit||!checked.valid||busy}>{busy?'กำลังบันทึก…':'ส่งที่อยู่จัดส่ง'}<span aria-hidden="true"> →</span></button>
 <p className="footnote">กรอกครบทุกช่องและเบอร์มือถือ 10 หลัก จึงจะกดส่งได้</p></form>;
}

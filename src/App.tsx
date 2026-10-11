import {useEffect,useState} from 'react';
import AddressForm from './AddressForm';
import type {AddressFields} from '../shared/address';
type Config={liffId:string;submissionEnabled:boolean};
export default function App(){
 const [state,setState]=useState<'loading'|'preview'|'ready'|'success'|'error'>('loading'),[message,setMessage]=useState('กำลังเชื่อมต่อ LINE…');
 const [token,setToken]=useState(''),[liff,setLiff]=useState<(typeof import('@line/liff'))['default']>();
 useEffect(()=>{let live=true;(async()=>{try{
  const response=await fetch('/api/config');if(!response.ok)throw Error();const config=await response.json() as Config;
  if(!config.liffId||!config.submissionEnabled){if(live){setState('preview');setMessage('ตัวอย่างฟอร์ม — ยังไม่เปิดส่งข้อมูล สามารถลองเลือกที่อยู่ได้ค่ะ');}return;}
  const sdk=(await import('@line/liff')).default;await sdk.init({liffId:config.liffId});
  if(!sdk.isLoggedIn()){sdk.login({redirectUri:window.location.href});return;}
  const queryToken=new URL(window.location.href).searchParams.get('token');
  if(!queryToken||!sdk.getIDToken())throw Error();
  if(live){setToken(queryToken);setLiff(sdk);setState('ready');setMessage('กรุณากรอกข้อมูลให้ครบทั้ง 7 ช่องค่ะ');}
 }catch{if(live){setState('error');setMessage('กรุณาเปิดลิงก์ฟอร์มใหม่จากแชท LINE ของร้านค่ะ');}}})();return()=>{live=false;};},[]);
 async function submit(fields:AddressFields){
  try{setMessage('กำลังบันทึกข้อมูล กรุณารอสักครู่ค่ะ');
   const idToken=liff?.getIDToken();if(!idToken){setState('error');setMessage('การเข้าสู่ระบบหมดอายุ กรุณาเปิดฟอร์มจาก LINE ใหม่ค่ะ');return;}
   const response=await fetch('/api/address',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,token,idToken})});
   const result=await response.json() as {status:string;message:string;notificationStatus?:string};
   if(response.ok&&result.status==='accepted'){setState('success');setMessage(result.notificationStatus==='sent'?result.message:'ได้รับที่อยู่แล้วค่ะ แต่ยังส่งข้อความยืนยันใน LINE ไม่สำเร็จ');}
   else setMessage(result.message||'ยังบันทึกไม่สำเร็จ กรุณาลองอีกครั้งค่ะ');
  }catch{setMessage('ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้งด้วยลิงก์เดิมค่ะ');}
 }
 return <main><aside className="brand-panel"><div className="brand">B LOOK<span>GARMENT</span></div><div className="side-copy"><div className="eyebrow">DELIVERY DETAILS</div><h1>เสื้อที่ใช่<br/>ส่งถึงคุณ</h1><p>อีกขั้นตอนเดียว<br/>เพื่อให้เราส่งงานถึงมือคุณอย่างถูกต้อง</p></div><div className="side-footer">MADE WITH CARE · B LOOK GARMENT</div></aside>
 <section className="form-panel"><header><div className="eyebrow">ข้อมูลสำหรับจัดส่ง</div><h2>{state==='success'?'ได้รับที่อยู่แล้วค่ะ':'ที่อยู่จัดส่งของคุณ'}</h2><p>กรอกชื่อและที่อยู่ที่สะดวกรับสินค้าได้เลยค่ะ</p></header><div className={'notice '+(state==='success'?'success':'')} role="status" aria-live="polite">{message}</div>
 {state!=='success'?<AddressForm canSubmit={state==='ready'} onSubmit={submit}/>:<div className="thank-you"><div className="checkmark">✓</div><h3>ขอบคุณค่ะ</h3><p>แอดมินจะตรวจสอบข้อมูลที่อยู่ให้ค่ะ</p>{liff?.isInClient()&&<button onClick={()=>liff.closeWindow()}>กลับไปที่แชท LINE</button>}</div>}
 </section></main>;
}

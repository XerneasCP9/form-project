import {geography,validateAddress,dataVersion} from '../shared/address';
export interface Env{ASSETS:{fetch:(request:Request)=>Promise<Response>};LIFF_ID:string;LINE_LOGIN_CHANNEL_ID:string;SUBMISSION_ENABLED:string;N8N_WEBHOOK_URL:string}
export type Transport=typeof fetch;
function json(value:unknown,status=200,cache='no-store'){return Response.json(value,{status,headers:{'Cache-Control':cache,'X-Content-Type-Options':'nosniff'}});}
export async function handleRequest(request:Request,env:Env,transport:Transport=fetch):Promise<Response>{
 const url=new URL(request.url);
 const ready=env.SUBMISSION_ENABLED==='true'&&!!env.LIFF_ID&&/^\d+$/.test(env.LINE_LOGIN_CHANNEL_ID||'')&&!!env.N8N_WEBHOOK_URL;
 if(url.pathname==='/api/config'&&request.method==='GET')return json({liffId:env.LIFF_ID||'',submissionEnabled:ready,dataVersion});
 const geoMatch=url.pathname.match(/^\/api\/geography\/subdistrict\/(\d{6})$/);
 if(geoMatch&&request.method==='GET'){
  const records=geography.filter(r=>r.subdistrictCode===geoMatch[1]);return records.length?json({records,dataVersion},200,'public, max-age=3600'):json({message:'ไม่พบตำบล'},404);
 }
 if(url.pathname==='/api/address'){
  if(request.method!=='POST')return json({status:'rejected',message:'Method not allowed'},405);
  const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return json({status:'rejected',message:'ไม่อนุญาตแหล่งที่มานี้'},403);
  if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return json({status:'rejected',message:'ต้องส่งข้อมูล JSON'},415);
  const declared=Number(request.headers.get('Content-Length')||0);if(declared>16384)return json({status:'rejected',message:'ข้อมูลยาวเกินกำหนด'},413);
  let b:Record<string,unknown>;
  try{const text=await request.text();if(new TextEncoder().encode(text).length>16384)return json({status:'rejected',message:'ข้อมูลยาวเกินกำหนด'},413);const parsed=JSON.parse(text);if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw Error();b=parsed;}catch{return json({status:'rejected',message:'ข้อมูลไม่ถูกต้อง'},400);}
  const result=validateAddress(b);if(!result.valid)return json({status:'rejected',message:Object.values(result.errors).join('\n'),errors:result.errors},422);
  if(typeof b.token!=='string'||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(b.token))return json({status:'rejected',message:'กรุณาเปิดลิงก์ฟอร์มที่ได้รับจาก LINE'},401);
  if(typeof b.idToken!=='string'||!b.idToken||b.idToken.length>8192)return json({status:'rejected',message:'กรุณาเข้าสู่ระบบ LINE ใหม่'},401);
  if(!ready)return json({status:'unconfigured',message:'ฟอร์มยังไม่เปิดรับข้อมูล กรุณารอแอดมินเชื่อมต่อ LINE ค่ะ'},503);
  try{
   const upstream=await transport(env.N8N_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...result.fields,province:result.record!.province,district:result.record!.district,subdistrict:result.record!.subdistrict,dataVersion,token:b.token,idToken:b.idToken}),signal:AbortSignal.timeout(25000)});
   const response=await upstream.json() as Record<string,unknown>;
   if(response.status==='accepted'&&upstream.ok)return json({status:'accepted',message:'ได้รับข้อมูลที่อยู่จัดส่งเรียบร้อยแล้วค่ะ',notificationStatus:response.notificationStatus==='sent'?'sent':'pending'});
   if(['rejected','unconfigured'].includes(String(response.status)))return json({status:response.status,message:typeof response.message==='string'?response.message:'กรุณาตรวจสอบข้อมูล'},upstream.status>=400?upstream.status:422);
   return json({status:'error',message:'ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้งด้วยลิงก์เดิม'},502);
  }catch{return json({status:'error',message:'ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้งด้วยลิงก์เดิม'},502);}
 }
 if(url.pathname.startsWith('/api/'))return json({message:'ไม่พบ API'},404);
 return env.ASSETS.fetch(request);
}
export default {fetch(request:Request,env:Env){return handleRequest(request,env);}};

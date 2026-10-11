import {describe,it,expect,vi} from 'vitest';
import {handleRequest,type Env,type Transport} from '../worker/index';
import {geography} from '../shared/address';
const r=geography[0];
const body={fullName:'ผู้ทดสอบ',addressLine:'99',phone:'0812345678',provinceCode:r.provinceCode,districtCode:r.districtCode,subdistrictCode:r.subdistrictCode,postalCode:r.postalCode,token:'f2e07b39-ca4f-4350-8caa-e615bf4bed0d',idToken:'test-token'};
const env:Env={LIFF_ID:'test-liff',LINE_LOGIN_CHANNEL_ID:'1234567890',SUBMISSION_ENABLED:'true',N8N_WEBHOOK_URL:'https://example.test/webhook',ASSETS:{fetch:async()=>new Response('asset')}};
const request=(data:unknown=body,origin='https://form.test')=>new Request('https://form.test/api/address',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)});
describe('Worker API',()=>{
 it('returns preview config before LINE setup',async()=>{const response=await handleRequest(new Request('https://form.test/api/config'),{...env,LIFF_ID:''});expect((await response.json() as {submissionEnabled:boolean}).submissionEnabled).toBe(false);});
 it('exposes authoritative geography by subdistrict',async()=>{const response=await handleRequest(new Request('https://form.test/api/geography/subdistrict/'+r.subdistrictCode),env);expect(response.status).toBe(200);expect((await response.json() as {records:unknown[]}).records.length).toBeGreaterThan(0);});
 it.each([{phone:'081234567'},{phone:'08123456789'},{provinceCode:'50'},{postalCode:'99999'},{fullName:''}])('rejects invalid request without contacting n8n %j',async change=>{const upstream=vi.fn();const response=await handleRequest(request({...body,...change}),env,upstream as Transport);expect(response.status).toBe(422);expect(upstream).not.toHaveBeenCalled();});
 it('rejects another origin',async()=>expect((await handleRequest(request(body,'https://other.test'),env)).status).toBe(403));
 it('refuses to submit before setup',async()=>expect((await handleRequest(request(),{...env,LIFF_ID:''})).status).toBe(503));
 it('forwards canonical geography but no client userId',async()=>{let forwarded:Record<string,unknown>={};const upstream=vi.fn(async(_url:unknown,init:RequestInit)=>{forwarded=JSON.parse(String(init.body));return Response.json({status:'accepted',notificationStatus:'sent'});});const response=await handleRequest(request({...body,lineUserId:'spoof'}),env,upstream as Transport);expect(response.status).toBe(200);expect(forwarded.province).toBe(r.province);expect(forwarded.lineUserId).toBeUndefined();expect((await response.json() as {notificationStatus:string}).notificationStatus).toBe('sent');});
 it('retains accepted address status if LINE confirmation failed',async()=>{const response=await handleRequest(request(),env,vi.fn(async()=>Response.json({status:'accepted',notificationStatus:'pending'})) as Transport);expect((await response.json() as {status:string;notificationStatus:string})).toMatchObject({status:'accepted',notificationStatus:'pending'});});
 it('reports timeouts without claiming successful storage',async()=>{const response=await handleRequest(request(),env,vi.fn(async()=>{throw Error('timeout');}) as Transport);expect(response.status).toBe(502);expect((await response.json() as {status:string}).status).toBe('error');});
 it('passes rejected identity and expired-token responses',async()=>{for(const status of [401,422]){const response=await handleRequest(request(),env,vi.fn(async()=>Response.json({status:'rejected',message:'rejected'},{status})) as Transport);expect(response.status).toBe(status);}});
 it('does not report success for unexpected upstream output',async()=>expect((await handleRequest(request(),env,vi.fn(async()=>Response.json({ok:true})) as Transport)).status).toBe(502));
});

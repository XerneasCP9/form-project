import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const workflow=JSON.parse(await readFile(new URL('../integration/n8n-receiver-draft.json',import.meta.url),'utf8'));
const run=(name,input,nodes={})=>{
 const source=workflow.nodes.find(n=>n.name===name).parameters.jsCode;
 const lookup=name=>({item:{json:nodes[name]}});
 return new Function('$','$input',source)(lookup,{first:()=>({json:input})})[0].json;
};
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS '+name);};
const c={channelId:'1234567890',idToken:'private-test-token',isTest:true};
check('LINE verify rejects invalid token',()=>assert.equal(run('Check LINE Identity',{statusCode:400,body:{}},{'Prepare LIFF Submission':c}).identityValid,false));
check('LINE verify rejects wrong audience',()=>assert.equal(run('Check LINE Identity',{statusCode:200,body:{sub:'U'+'0'.repeat(32),aud:'wrong'}},{'Prepare LIFF Submission':c}).identityValid,false));
check('LINE verify drops ID token from downstream',()=>assert.equal(run('Check LINE Identity',{statusCode:200,body:{sub:'U'+'0'.repeat(32),aud:c.channelId}},{'Prepare LIFF Submission':c}).idToken,undefined));
for(const [statusCode,headers,expected] of [[200,{},'sent'],[500,{},'pending'],[402,{},'pending'],[409,{},'pending'],[409,{'x-line-accepted-request-id':'test-request'},'sent']])check('LINE push status '+statusCode+' '+expected,()=>assert.equal(run('Check LINE Confirmation',{statusCode,headers},{'Resolve Saved Address':{submissionKey:'token'}}).notificationStatus,expected));
check('network error leaves LINE notification pending',()=>assert.equal(run('Check LINE Confirmation',{error:'network'},{'Resolve Saved Address':{submissionKey:'token'}}).notificationStatus,'pending'));
check('storage error does not claim success',()=>assert.equal(run('Address Storage Error',{}).status,'error'));
console.log(`${count} simulated n8n code checks passed; no real LINE API used.`);

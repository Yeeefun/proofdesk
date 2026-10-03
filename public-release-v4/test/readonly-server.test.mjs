import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {startReadOnlyServer} from '../scripts/serve-readonly.mjs';
import {seedState} from '../src/lib/core.mjs';
const fixtures=seedState();
const docs=[...fixtures.claims,...fixtures.evidence,...fixtures.decisions];
const mockFetch=async(url,options)=>{
  assert.equal(new URL(url).host,'w6fg4266.api.sanity.io');
  assert.equal(options.headers.Authorization,undefined);
  return Response.json({result:docs});
};
const close=server=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);});
const raw=(port,url,method='GET')=>new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port,path:url,method},res=>{let body='';res.on('data',d=>body+=d);res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}));});req.on('connect',(res,socket)=>{socket.destroy();resolve({status:res.statusCode,body:'',headers:res.headers});});req.on('error',reject);req.end();});
test('built bilingual routes, cloud read, HEAD and write rejection',async()=>{
 const server=await startReadOnlyServer({port:0,fetcher:mockFetch,env:{SANITY_API_TOKEN:'deliberately_ignored_test_marker'}});
 try{
  assert.equal(server.address().address,'127.0.0.1');const port=server.address().port;
  for(const [url,lang]of [['/','zh-CN'],['/?lang=zh','zh-CN'],['/zh/','zh-CN'],['/en/','en']]){const r=await raw(port,url);assert.equal(r.status,200);assert.ok(r.body.includes(`lang="${lang}"`));assert.ok(r.body.includes('href="/en/"'));assert.ok(r.body.includes('href="/"'));}
  const redirect=await raw(port,'/?lang=en');assert.equal(redirect.status,302);assert.equal(redirect.headers.location,`http://127.0.0.1:${port}/en/`);
  const followed=await fetch(`http://127.0.0.1:${port}/?lang=en`);assert.equal(followed.status,200);assert.ok((await followed.text()).includes('lang="en"'));
  const state=await raw(port,'/api/state');assert.equal(state.status,200);assert.equal(JSON.parse(state.body).mode,'sanity');
  const head=await raw(port,'/en/','HEAD');assert.equal(head.status,200);assert.equal(head.body,'');
  const headRedirect=await raw(port,'/?lang=en','HEAD');assert.equal(headRedirect.status,302);assert.equal(headRedirect.body,'');
  for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS','TRACE','CONNECT'])for(const route of ['/api/action','/api/state','/'])assert.equal((await raw(port,route,method)).status,403);
  assert.equal((await raw(port,'/api/action')).status,403);
  assert.equal((await raw(port,'/missing-file')).status,404);
  const csv=await raw(port,'/fixture-source.csv');assert.equal(csv.status,200);assert.match(csv.headers['content-type'],/text\/csv/);
 }finally{await close(server);}
});
test('raw traversal, encoded separators and external symlink cannot escape asset root',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'proofdesk-readonly-'));const assets=path.join(temp,'client'),outside=path.join(temp,'outside');
 await mkdir(assets);await mkdir(outside);await writeFile(path.join(outside,'canary.txt'),'outside_canary');
 await symlink(outside,path.join(assets,'link'),'junction');
 const server=await startReadOnlyServer({port:0,assetRoot:assets,fetcher:mockFetch});
 try{const port=server.address().port;
  for(const url of ['/../outside/canary.txt','/%2e%2e/outside/canary.txt','/%2e%2e%2foutside/canary.txt','/..%5coutside%5ccanary.txt','/C:%5coutside','/%00','/%broken','/link/canary.txt']){const r=await raw(port,url);assert.equal(r.status,403,url);assert.ok(!r.body.includes('outside_canary'));}
 }finally{await close(server);const tempRoot=path.resolve(os.tmpdir());assert.ok(path.resolve(temp).startsWith(tempRoot+path.sep));await rm(temp,{recursive:true,force:true});}
});
test('upstream errors, bad payload and invalid selector yield 503 with no state',async()=>{
 for(const options of [{fetcher:async()=>{throw Error('outage');}},{fetcher:async()=>new Response('bad',{status:500})},{fetcher:async()=>Response.json({result:null})},{fetcher:mockFetch,env:{SANITY_DATASET:'../private'}}]){
  const server=await startReadOnlyServer({port:0,...options});
  try{const r=await raw(server.address().port,'/api/state');assert.equal(r.status,503);assert.equal(JSON.parse(r.body).state,undefined);}finally{await close(server);}
 }
});

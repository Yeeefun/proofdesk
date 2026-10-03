import assert from 'node:assert/strict';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {handle} from '../dist/server/index.js';
const origin='https://proofdesk.test';
const mappings=[];
const assets={fetch(request){mappings.push(new URL(request.url).pathname);return new Response('asset');}};
for(const route of ['/','/?lang=zh','/en/','/zh/'])assert.equal((await handle(new Request(origin+route),{ASSETS:assets})).status,200);
assert.deepEqual(mappings,['/index.html','/index.html','/en/index.html','/index.html']);
const redirect=await handle(new Request(origin+'/?lang=en'),{ASSETS:assets});assert.equal(redirect.status,302);assert.equal(redirect.headers.get('Location'),origin+'/en/');
for(const verb of ['POST','PUT','DELETE'])assert.equal((await handle(new Request(origin+'/api/action',{method:verb}))).status,403);
const outage=await handle(new Request(origin+'/api/state'),{},async()=>{throw Error('simulated outage');});
assert.equal(outage.status,503);assert.equal((await outage.json()).state,undefined);
const live=await handle(new Request(origin+'/api/state'));
assert.equal(live.status,200);
const body=await live.json();
const counts={claims:body.state.claims.length,evidence:body.state.evidence.length,decisions:body.state.decisions.length};
assert.deepEqual(counts,{claims:2,evidence:1,decisions:2});assert.equal(body.assessment.code,'needs_review');
assert.ok(body.state.decisions.some(d=>d.action==='withdraw'));assert.ok(body.state.decisions.some(d=>d.action==='approve'));
for(const [file,lang] of [['dist/client/index.html','zh-CN'],['dist/client/en/index.html','en']]) {
  const html=await readFile(file,'utf8');assert.ok(html.includes(`lang="${lang}"`));assert.ok(html.includes('id="history"'));assert.ok(html.includes('id="claim-original"'));
}
const result={verified_utc:new Date().toISOString(),tests:'passed',routes:mappings,action_verbs_forbidden:['POST','PUT','DELETE'],cloud_counts:counts,assessment:body.assessment.code,outage_status:503,no_fallback:true,no_write_token_required:true,public_deployment_verified:false};
await mkdir('.local',{recursive:true});
await writeFile('.local/verify-worker.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));

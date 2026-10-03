import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {seedState,assess,applyAction,validateState} from '../src/lib/core.mjs';
import {localRepository} from '../src/lib/local-repository.mjs';
import {sanityRepository} from '../src/lib/sanity-repository.mjs';

test('只有UTF-8 CSV不能支持任意格式；缩小后通过，旧文字和理由保留',()=>{
  const initial=seedState(),unchanged=structuredClone(initial);
  assert.equal(assess(initial).code,'scope_gap');
  const approved=applyAction(initial,{action:'approve_narrow',reason:'只测了UTF-8 CSV，缩小范围'});
  assert.equal(assess(approved).code,'reviewed_supported');
  assert.equal(approved.claims.length,2);assert.equal(approved.claims[0].text,'所有格式都兼容');
  assert.equal(approved.claims[1].previousClaim._ref,initial.claims[0]._id);
  assert.equal(approved.decisions[0].reason,'只测了UTF-8 CSV，缩小范围');assert.deepEqual(initial,unchanged);
});
test('撤回后待复核：原证据、旧审核保留；重复撤回不新增决定',()=>{
  const approved=applyAction(seedState(),{action:'approve_narrow',reason:'范围已核'});
  const withdrawn=applyAction(approved,{action:'withdraw',evidenceId:'demo-evidence-csv',reason:'这份演示验证作废'});
  assert.equal(assess(withdrawn).code,'needs_review');assert.deepEqual(withdrawn.evidence,approved.evidence);
  assert.deepEqual(withdrawn.decisions[0],approved.decisions[0]);assert.equal(withdrawn.decisions.length,2);
  assert.throws(()=>applyAction(withdrawn,{action:'withdraw',evidenceId:'demo-evidence-csv',reason:'重复'}));
});
test('缺失证据显示未知，不能因为空白就判假或通过',()=>{
  const s=seedState();s.evidence=[];assert.equal(assess(s).code,'unknown');
  assert.throws(()=>applyAction(s,{action:'approve_narrow',reason:'没有证据'}));
});
test('明确反证交人工判断；不能自动审批或判整条声明为假',()=>{
  const s=seedState();s.evidence[0].result='contradicts';assert.equal(assess(s).code,'counterevidence');
  assert.throws(()=>applyAction(s,{action:'approve_narrow',reason:'绕过反证'}));
});
test('未知编码不凭CSV格式通过；空理由和未知动作拒绝',()=>{
  const s=seedState();s.evidence[0].encodings=['GB18030'];assert.throws(()=>applyAction(s,{action:'approve_narrow',reason:'编码不相符'}));
  assert.throws(()=>applyAction(seedState(),{action:'approve_narrow',reason:'   '}));
  assert.throws(()=>applyAction(seedState(),{action:'delete',reason:'不能删除'}));
});
test('保存后重新建立仓库仍可恢复完整状态；坏文件不默默换成fixtures',async()=>{
  const root=await mkdtemp(path.resolve('.local-test-'));
  try {const repo=localRepository(root);await repo.update({action:'approve_narrow',reason:'实际持久化测试'});await repo.update({action:'withdraw',evidenceId:'demo-evidence-csv',reason:'撤回'});
    const reloaded=await localRepository(root).load();assert.equal(assess(reloaded).code,'needs_review');assert.equal(reloaded.claims.length,2);assert.equal(reloaded.decisions.length,2);
    const disk=JSON.parse(await readFile(path.join(root,'state.json'),'utf8'));assert.deepEqual(disk,reloaded);
    await writeFile(path.join(root,'state.json'),'{broken');await assert.rejects(localRepository(root).load(),/未替换/);
  }finally {await rm(root,{recursive:true,force:true});}
});
test('同一仓库并发重复提交串行化，只有一次审核决定',async()=>{
  const root=await mkdtemp(path.resolve('.local-test-'));
  try {const repo=localRepository(root);const outcomes=await Promise.allSettled([repo.update({action:'approve_narrow',reason:'第一次'}),repo.update({action:'approve_narrow',reason:'重复点击'})]);
    assert.equal(outcomes.filter(o=>o.status==='fulfilled').length,1);const saved=await repo.load();assert.equal(saved.claims.length,2);assert.equal(saved.decisions.length,1);
  }finally {await rm(root,{recursive:true,force:true});}
});
test('云端配置缺失时明确拒绝，schema关系和非法决定可检验',async()=>{
  assert.throws(()=>sanityRepository({}),/未连接云端/);assert.throws(()=>sanityRepository({SANITY_PROJECT_ID:'demo',SANITY_DATASET:'demo'},{write:true}),/凭证/);
  const {schemaTypes}=await import('../sanity/schemaTypes.mjs');assert.deepEqual(schemaTypes.map(t=>t.name),['claim','evidence','reviewDecision']);
  const s=seedState();s.decisions.push({_id:'bad',_type:'reviewDecision',action:'approve',claimRef:{_ref:'missing'},evidenceRefs:[],reason:'bad'});assert.throws(()=>validateState(s));
});

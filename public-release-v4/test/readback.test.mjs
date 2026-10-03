import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,applyAction} from '../src/lib/core.mjs';
import {verifyReadback} from '../src/lib/readback.mjs';
test('真实形式的系统元数据不影响读回核对，声明和撤回历史须齐全',()=>{
  const approved=applyAction(seedState(),{action:'approve_narrow',reason:'限定范围'});
  const expected=applyAction(approved,{action:'withdraw',evidenceId:'demo-evidence-csv',reason:'撤回重查'});
  const actual=structuredClone(expected);for(const docs of [actual.claims,actual.evidence,actual.decisions])for(const d of docs){d._rev='server-revision';d._updatedAt='2026-10-02T00:00:00Z';}
  assert.equal(verifyReadback(expected,actual),actual);
});
test('旧快照没有新审核记录时拒绝成功；空读不能冒充seed成功',()=>{
  const before=seedState(),next=applyAction(before,{action:'approve_narrow',reason:'需要读回'});
  assert.throws(()=>verifyReadback(next,before),/未认定/);
  assert.throws(()=>verifyReadback(before,{version:1,claims:[],evidence:[],decisions:[]}),/未认定/);
});
test('历史被删除或理由被改变时拒绝成功',()=>{
  const expected=applyAction(seedState(),{action:'approve_narrow',reason:'保留理由'});
  const changed=structuredClone(expected);changed.decisions[0].reason='不同理由';assert.throws(()=>verifyReadback(expected,changed),/未认定/);
  const deleted=structuredClone(expected);deleted.claims.shift();delete deleted.claims[0].previousClaim;assert.throws(()=>verifyReadback(expected,deleted),/未认定/);
});

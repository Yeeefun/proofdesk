import {isDeepStrictEqual} from 'node:util';
import {validateState} from './core.mjs';
const systemFields=new Set(['_rev','_createdAt','_updatedAt']);
export function verifyReadback(expected,actual) {
  validateState(actual);
  const indexed=new Map([...actual.claims,...actual.evidence,...actual.decisions].map(d=>[d._id,d]));
  for(const document of [...expected.claims,...expected.evidence,...expected.decisions]) {
    const fetched=indexed.get(document._id);
    if(!fetched || Object.entries(document).some(([key,value])=>!systemFields.has(key)&&!isDeepStrictEqual(fetched[key],value)))
      throw new Error('云端读回缺少或改变了预期记录；未认定写后验收成功');
  }
  return actual;
}

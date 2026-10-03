import '../src/lib/env.mjs';
import {sanityRepository} from '../src/lib/sanity-repository.mjs';
import {seedState,assess} from '../src/lib/core.mjs';
import {verifyReadback} from '../src/lib/readback.mjs';
const [action,...args]=process.argv.slice(2);
if(!['read','seed','approve','withdraw'].includes(action)) {console.error('用法：cloud read | seed --confirm-demo-only | approve 理由 | withdraw 证据ID 理由');process.exit(2);}
try {
  const repo=sanityRepository(process.env,{write:action!=='read'});
  if(action==='read') {const state=await repo.load();console.log(JSON.stringify({source:'Sanity real fetch',counts:{claims:state.claims.length,evidence:state.evidence.length,decisions:state.decisions.length},assessment:assess(state)},null,2));}
  else if(action==='seed') {
    if(args[0]!=='--confirm-demo-only') throw new Error('仅允许明确确认后写入自拟演示数据');
    const prior=await repo.load();if(prior.claims.length||prior.evidence.length||prior.decisions.length) throw new Error('演示类型已有数据，未覆盖任何记录；请用专用空数据集');
    const state=seedState();await repo.append(state);const readback=verifyReadback(state,await repo.load());if(readback.claims.length!==1||readback.evidence.length!==1) throw new Error('写后读回未达到预期');console.log(JSON.stringify({source:'Sanity real transaction + verified readback',counts:{claims:readback.claims.length,evidence:readback.evidence.length},assessment:assess(readback)},null,2));
  } else {
    const input=action==='approve'?{action:'approve_narrow',reason:args.join(' ')}:{action:'withdraw',evidenceId:args[0],reason:args.slice(1).join(' ')};
    const readback=await repo.update(input);console.log(JSON.stringify({source:'Sanity real transaction + verified readback',assessment:assess(readback),records:readback.claims.length+readback.evidence.length+readback.decisions.length},null,2));
  }
}catch {console.error('云端操作失败或配置不足；未认定真实接入成功。检查本机项目/数据集/权限和参数，不将凭证贴入聊天。');process.exitCode=1;}

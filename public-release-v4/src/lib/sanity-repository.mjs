import {createClient} from '@sanity/client';
import {validateState,applyAction} from './core.mjs';
import {verifyReadback} from './readback.mjs';
export function sanityRepository(env,options={write:false}) {
  const projectId=env.SANITY_PROJECT_ID,dataset=env.SANITY_DATASET;
  if(!projectId||!dataset) throw new Error('缺少SANITY_PROJECT_ID或SANITY_DATASET；未连接云端');
  if(!/^[a-z0-9]+$/.test(projectId)||!/^[a-z0-9_-]+$/.test(dataset)) throw new Error('项目或数据集标识格式不正确');
  if(options.write&&!env.SANITY_API_TOKEN) throw new Error('写入只允许私有CLI，需服务器环境凭证');
  const client=createClient({projectId,dataset,apiVersion:env.SANITY_API_VERSION||'2026-03-01',useCdn:false,perspective:'published',maxRetries:0,timeout:10000,...(options.write?{token:env.SANITY_API_TOKEN}:{})});
  async function load() {
    const docs=await client.fetch('*[_type in ["claim","evidence","reviewDecision"]]');
    return validateState({version:1,claims:docs.filter(d=>d._type==='claim'),evidence:docs.filter(d=>d._type==='evidence'),decisions:docs.filter(d=>d._type==='reviewDecision')});
  }
  async function append(state,prior={claims:[],evidence:[],decisions:[]}) {
    if(!options.write) throw new Error('只读连接不能写入');
    const oldIds=new Set([...prior.claims,...prior.evidence,...prior.decisions].map(d=>d._id));
    let tx=client.transaction();
    for(const doc of [...state.claims,...state.evidence,...state.decisions]) if(!oldIds.has(doc._id)) {
      const {_rev,_createdAt,_updatedAt,...newDocument}=doc;
      tx=tx.create(newDocument);
    }
    return tx.commit();
  }
  return {load,append,async update(input){const prior=await load();const next=applyAction(prior,input);await append(next,prior);return verifyReadback(next,await load());}};
}

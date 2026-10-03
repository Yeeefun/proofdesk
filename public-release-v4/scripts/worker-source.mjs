import {validateState,currentClaim,assess} from './core.mjs';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function readState(env, fetcher=fetch) {
  const projectId=env.SANITY_PROJECT_ID||'w6fg4266';
  const dataset=env.SANITY_DATASET||'production';
  const version=env.SANITY_API_VERSION||'2026-03-01';
  if(!/^[a-z0-9]+$/.test(projectId)||!/^[a-z0-9_-]+$/.test(dataset)||!/^\d{4}-\d{2}-\d{2}$/.test(version))throw Error('Invalid public dataset configuration');
  const url=new URL(`https://${projectId}.api.sanity.io/v${version}/data/query/${dataset}`);
  url.searchParams.set('query','*[_type in ["claim","evidence","reviewDecision"]]');
  url.searchParams.set('perspective','published');
  const response=await fetcher(url,{signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'},cache:'no-store'});
  if(!response.ok)throw Error('Cloud read failed');
  const {result:docs}=await response.json();
  if(!Array.isArray(docs))throw Error('Invalid cloud response');
  return validateState({version:1,claims:docs.filter(d=>d._type==='claim'),evidence:docs.filter(d=>d._type==='evidence'),decisions:docs.filter(d=>d._type==='reviewDecision')});
}
export async function handle(request,env={},fetcher=fetch) {
  const url=new URL(request.url);
  if(url.pathname==='/api/action')return json({error:'云端UI只读，写入通过私有CLI显式执行。'},403);
  if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'Read-only public demo'},403);
  if(url.pathname==='/api/state') {
    try {const state=await readState(env,fetcher);return json({mode:'sanity',state,current:currentClaim(state),assessment:assess(state)});}
    catch {return json({mode:'sanity',error:'读取失败，当前结论未知。未退回fixtures；检查云端项目/数据集配置。'},503);}
  }
  if(url.pathname==='/'&&url.searchParams.get('lang')==='en')return Response.redirect(new URL('/en/',url),302);
  const assetURL=new URL(url);
  if(url.pathname==='/'||url.pathname==='/en/'||url.pathname==='/en'||url.pathname==='/zh/'||url.pathname==='/zh') {
    const english=url.searchParams.get('lang')==='en'||url.pathname.startsWith('/en');
    assetURL.pathname=english?'/en/index.html':'/index.html';assetURL.search='';
  }
  return env.ASSETS.fetch(new Request(assetURL,{method:request.method,headers:request.headers}));
}
export default {fetch:(request,env)=>handle(request,env)};


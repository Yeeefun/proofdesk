import {getRepository,mode} from '../../lib/repository.mjs';
export const prerender=false;
export async function POST({request,url}) {
  const origin=request.headers.get('origin');
  if(mode!=='local') return Response.json({error:'云端UI只读，写入通过私有CLI显式执行。'},{status:403});
  if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||origin!==url.origin||request.headers.get('content-type')!=='application/json')
    return Response.json({error:'只接受同源本机JSON操作。'},{status:403});
  if(Number(request.headers.get('content-length')||0)>4096) return Response.json({error:'请求过长'},{status:413});
  try {const raw=await request.text();if(raw.length>4096) return Response.json({error:'请求过长'},{status:413});const state=await getRepository().update(JSON.parse(raw));return Response.json({ok:true,records:state.claims.length+state.evidence.length+state.decisions.length});}
  catch {return Response.json({error:'操作未保存：请填理由并检查证据有效性；原记录未被删除。'},{status:400});}
}

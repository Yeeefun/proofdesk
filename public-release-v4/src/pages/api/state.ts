import {getRepository,mode} from '../../lib/repository.mjs';
import {assess,currentClaim} from '../../lib/core.mjs';
export const prerender=false;
export async function GET() {
  try {const state=await getRepository().load();return Response.json({mode,state,current:currentClaim(state),assessment:assess(state)},{headers:{'Cache-Control':'no-store'}});}
  catch {return Response.json({mode,error:'读取失败，当前结论未知。未退回fixtures；检查本地文件或云端项目/数据集配置。'},{status:503,headers:{'Cache-Control':'no-store'}});}
}

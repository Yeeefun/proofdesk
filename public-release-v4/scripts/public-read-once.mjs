import {createClient} from '@sanity/client';
const started=Date.now();
const query='*[_type in ["claim","evidence","reviewDecision"]]';
// 明确公开配置；不导入env.mjs、不读.env、不取现有认证信息。
const client=createClient({projectId:'w6fg4266',dataset:'production',apiVersion:'2026-03-01',useCdn:false,perspective:'published',maxRetries:0,timeout:10000,withCredentials:false});
try {
  const result=await client.fetch(query);
  if(!Array.isArray(result)) throw new Error('返回类型不是记录数组');
  console.log(JSON.stringify({attempted_at_utc:new Date(started).toISOString(),duration_ms:Date.now()-started,projectId:'w6fg4266',dataset:'production',query,credential_supplied:false,maxRetries:0,success:true,returned_count:result.length,actual_result:result.length===0?[]:'nonempty_records_not_printed',counts:{claims:result.filter(d=>d._type==='claim').length,evidence:result.filter(d=>d._type==='evidence').length,reviewDecisions:result.filter(d=>d._type==='reviewDecision').length},interpretation:result.length===0?'公开只读查询成功，三类记录为空；不是完整集成成功':'公开只读查询成功；仅计数，不宣称完整云端闭环'},null,2));
}catch(error){
  console.log(JSON.stringify({attempted_at_utc:new Date(started).toISOString(),duration_ms:Date.now()-started,projectId:'w6fg4266',dataset:'production',credential_supplied:false,maxRetries:0,success:false,error_type:error.name,status_code:error.statusCode??null,interpretation:'公开读取失败；停止，不重试或改认证路径'},null,2));
  process.exitCode=1;
}

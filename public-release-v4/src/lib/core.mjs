import { randomUUID } from 'node:crypto';
export const ref = id => ({_type:'reference',_ref:id});
export const idOf = value => typeof value === 'string' ? value : value?._ref;
const referenced = (refs=[]) => refs.map(idOf);
export function seedState() {
  return {version:1,claims:[{_id:'demo-claim-v1',_type:'claim',version:1,text:'所有格式都兼容',formats:['*'],encodings:['*'],evidenceRefs:[ref('demo-evidence-csv')],createdAt:'2026-10-01T00:00:00Z'}],
    evidence:[{_id:'demo-evidence-csv',_type:'evidence',title:'虚构验证：UTF-8 CSV读入',formats:['CSV'],encodings:['UTF-8'],result:'supports',source:'本地自拟 fixture-source.csv；非真实产品测试',detail:'仅演示一份UTF-8 CSV；未测XLSX、其他编码或任意文件。',createdAt:'2026-10-01T00:00:00Z'}],decisions:[]};
}
export function currentClaim(state) { return state.claims.reduce((a,b)=>!a||b.version>a.version?b:a,null); }
export function isWithdrawn(state,id) { return state.decisions.some(d=>d.action==='withdraw' && referenced(d.evidenceRefs).includes(id)); }
const contains = (provided,required) => required.every(s=>provided.includes(s));
export function assess(state,claim=currentClaim(state)) {
  if(!claim) return {code:'unknown',label:'尚未确认',reason:'没有声明记录。',active:[]};
  const ids=referenced(claim.evidenceRefs);
  const linked=state.evidence.filter(e=>ids.includes(e._id));
  const active=linked.filter(e=>!isWithdrawn(state,e._id));
  const approvals=state.decisions.filter(d=>d.action==='approve' && idOf(d.claimRef)===claim._id);
  if(linked.length===0) return {code:'unknown',label:'尚未确认',reason:'没有可核对的证据；这不等于已证伪。',active};
  if(active.length===0 || approvals.some(d=>referenced(d.evidenceRefs).some(id=>isWithdrawn(state,id)||!active.some(e=>e._id===id))))
    return {code:'needs_review',label:'待复核',reason:'关联证据已撤回；旧审核记录仍保留，不能继续支撑当前表述。',active};
  if(active.some(e=>e.result==='contradicts')) return {code:'counterevidence',label:'有反证，待人工判断',reason:'有明确标记的反证；系统不自动把整条声明判为假。',active};
  const enough=active.some(e=>e.result==='supports' && contains(e.formats,claim.formats) && contains(e.encodings,claim.encodings));
  if(!enough) return {code:'scope_gap',label:'范围不足',reason:'证据只覆盖UTF-8 CSV，不能支持“所有格式”。请核对并缩小表述。',active};
  if(approvals.some(d=>referenced(d.evidenceRefs).length>0 && referenced(d.evidenceRefs).every(id=>active.some(e=>e._id===id)) && active.some(e=>referenced(d.evidenceRefs).includes(e._id)&&e.result==='supports'&&contains(e.formats,claim.formats)&&contains(e.encodings,claim.encodings)))) return {code:'reviewed_supported',label:'按限定范围审核通过',reason:'当前声明及所引用证据经过人工操作确认；不是所有格式兼容证明。',active};
  return {code:'supported_pending_review',label:'范围相符，待人工审核',reason:'范围字段相符，还没有人工审核决定。',active};
}
export function applyAction(state,input,clock=()=>new Date().toISOString(),makeId=()=>randomUUID()) {
  if(!['approve_narrow','withdraw'].includes(input?.action)) throw new Error('不支持的操作');
  if(typeof input.reason!=='string' || !input.reason.trim() || input.reason.trim().length>500) throw new Error('请填写1—500字的审核理由');
  const next=structuredClone(state),claim=currentClaim(next),createdAt=clock(),reason=input.reason.trim();
  if(input.action==='approve_narrow') {
    if(claim.text==='已验证UTF-8 CSV') throw new Error('当前已经是限定表述，不能重复创建审核版本');
    const narrowed={...claim,_id:'claim-'+makeId(),text:'已验证UTF-8 CSV',formats:['CSV'],encodings:['UTF-8'],version:claim.version+1,previousClaim:ref(claim._id),createdAt};
    const result=assess(next,narrowed);
    if(result.code!=='supported_pending_review') throw new Error('缺少有效的范围对应证据，不能审核通过');
    next.claims.push(narrowed);
    next.decisions.push({_id:'review-'+makeId(),_type:'reviewDecision',action:'approve',claimRef:ref(narrowed._id),evidenceRefs:result.active.map(e=>ref(e._id)),reason,actor:'本地操作人（身份未核验）',createdAt});
  } else {
    const evidence=next.evidence.find(e=>e._id===input.evidenceId);
    if(!evidence || !referenced(claim.evidenceRefs).includes(evidence._id)) throw new Error('未找到当前声明关联的证据');
    if(isWithdrawn(next,evidence._id)) throw new Error('证据已经撤回');
    next.decisions.push({_id:'review-'+makeId(),_type:'reviewDecision',action:'withdraw',claimRef:ref(claim._id),evidenceRefs:[ref(evidence._id)],reason,actor:'本地操作人（身份未核验）',createdAt});
  }
  return next;
}
export function validateState(state) {
  if(state?.version!==1 || !['claims','evidence','decisions'].every(k=>Array.isArray(state[k]))) throw new Error('数据结构版本不支持');
  const docs=[...state.claims,...state.evidence,...state.decisions];
  const ids=new Set();
  for(const d of docs) { if(!d?._id || ids.has(d._id)) throw new Error('记录ID缺失或重复'); ids.add(d._id); }
  for(const c of state.claims) {
    if(c._type!=='claim'||typeof c.text!=='string'||!Number.isInteger(c.version)||!Array.isArray(c.formats)||!Array.isArray(c.encodings)||!c.formats.length||!c.encodings.length) throw new Error('声明字段无效');
    if(c.previousClaim && !state.claims.some(p=>p._id===idOf(c.previousClaim))) throw new Error('旧声明引用缺失');
  }
  for(const e of state.evidence) if(e._type!=='evidence'||!Array.isArray(e.formats)||!Array.isArray(e.encodings)||!['supports','contradicts'].includes(e.result)) throw new Error('证据字段无效');
  for(const d of state.decisions) {
    if(d._type!=='reviewDecision'||!['approve','withdraw'].includes(d.action)||!state.claims.some(c=>c._id===idOf(d.claimRef))||!d.reason?.trim()||!Array.isArray(d.evidenceRefs)||!d.evidenceRefs.length||d.evidenceRefs.some(r=>!state.evidence.some(e=>e._id===idOf(r)))) throw new Error('审核决定引用或字段无效');
  }
  return state;
}

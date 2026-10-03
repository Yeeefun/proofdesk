const zh={
  subtitle:'先看证据能撑到哪里，再决定这句话怎么说。',brand:'夸夸刹车',
  localPending:'本地演示 · 虚构材料',cloudPending:'Sanity只读 · 待读取',
  localReady:'本地文件持久化 · 非Sanity',cloudReady:'Sanity读取成功 · 云端只读',
  banner:'所有材料均为自拟演示，不是客户或真实产品测试。这里核对证据范围，不提供万能真假判定。',
  translation:'',loading:'正在读取记录…',claim:'当前声明',noClaim:'还没有声明',
  scopeHint:'范围字段和文字须由人一起确认；字段相符不是自动语义核查。',
  localHeading:'人工处理',cloudHeading:'公开只读演示',
  localIntro:'本次最小演示只支持：缩小为“已验证UTF-8 CSV”，或撤回其证据。',
  cloudIntro:'只读查看当前结论、证据有效性与右侧历史。公开页面不提供写入；撤回记录不会删除原证据或旧审核。',
  reasonLabel:'这次处理的理由（必填）',reasonPlaceholder:'例如：只测了UTF-8 CSV，未测其他格式。',
  approve:'缩小表述并记录审核',withdraw:'撤回这条证据',
  actorHint:'操作人身份未核验。记录是一次本地操作，不代替负责人验收。',
  evidence:'对应证据',fixture:'查看自拟CSV素材',fixtureHint:'文件本身仅作演示；没有借此实际证明任意软件兼容性。',
  history:'记录仍在',historySummary:'声明版本与处理历史',
  historyHint:'撤回以新增审核决定记录。旧声明、原证据和旧审核决定均保留。',
  localPath:'一分钟路径：范围不足 → 填理由缩小并审核 → 再填理由撤回证据 → 待复核 → 刷新看历史。',
  cloudPath:'只读查看路径：当前声明与结论原因 → 证据有效性 → 声明版本和处理决定 → 刷新重读Sanity。',
  readFailure:'读取失败，当前结论未知。未退回fixtures；请检查连接或项目/数据集配置。',
  failureMode:'读取失败 · 当前结论未知',noFallback:'云端模式读取失败时显示未知，绝不偷偷换成本地演示。',
  active:'当前有效',withdrawn:'已撤回',source:'来源',noEvidence:'没有对应证据',
  noEvidenceReason:'没有证据意味着尚未确认，不等于已证伪。',unknown:'未知',
  format:'格式',encoding:'编码',wildcard:'* 表示任意',version:'声明',approveRecord:'审核限定表述',withdrawRecord:'撤回证据',
  original:'原始记录（未改写）',reasonRequired:'请先填写理由。',saved:'已保存。原记录仍保留。',
  actionFailed:'操作未保存：请填理由并检查证据有效性；原记录未被删除。',
};
const en={
  subtitle:'Check what the evidence covers before deciding how to phrase the claim.',brand:'A Brake for Overconfident Claims',
  localPending:'Local demo · Fictional material',cloudPending:'Sanity read-only · Loading',
  localReady:'Local file storage · Not Sanity',cloudReady:'Sanity connected · Read-only',
  banner:'All material is fictional, not customer evidence or a real product test. This prototype reviews evidence scope; it is not a general fact checker.',
  translation:'English labels and known demo text are display translations. Original records in Sanity are unchanged and remain available below. Unmapped text stays in its original language.',
  loading:'Reading records…',claim:'Current claim',noClaim:'No claim recorded',
  scopeHint:'A person must check both the wording and scope fields. Matching fields is not an automatic semantic review.',
  localHeading:'Human review',cloudHeading:'Public read-only demo',
  localIntro:'This small local demo supports narrowing the claim to “Verified for UTF-8 CSV”, then withdrawing its evidence.',
  cloudIntro:'Inspect the current assessment, evidence status and history. This public page cannot write records. Withdrawal preserves the original evidence and prior approval.',
  reasonLabel:'Reason for this action (required)',reasonPlaceholder:'For example: Only UTF-8 CSV was checked; other formats were not tested.',
  approve:'Narrow claim and record review',withdraw:'Withdraw this evidence',
  actorHint:'Actor labels are not verified identities. This records a local action, not acceptance by a responsible reviewer.',
  evidence:'Linked evidence',fixture:'View fictional CSV material',fixtureHint:'This file is only demonstration material. It does not prove compatibility of any real software.',
  history:'History is retained',historySummary:'Claim versions and review history',
  historyHint:'Withdrawal adds a review decision. The old claim, original evidence and prior approval remain.',
  localPath:'One-minute path: scope gap → enter a reason and narrow the claim → enter another reason and withdraw evidence → needs review → refresh to inspect history.',
  cloudPath:'Read-only path: current claim and assessment → evidence status → claim versions and decisions → refresh to read Sanity again.',
  readFailure:'Read failed; the current conclusion is unknown. No local fixtures were substituted. Check connectivity and project/dataset configuration.',
  failureMode:'Read failed · Conclusion unknown',noFallback:'A failed cloud read shows an unknown conclusion. It never falls back to local fixtures.',
  active:'Currently active',withdrawn:'Withdrawn',source:'Source',noEvidence:'No linked evidence',
  noEvidenceReason:'Missing evidence means unconfirmed, not disproven.',unknown:'Unknown',
  format:'Format',encoding:'Encoding',wildcard:'* means any',version:'Claim',approveRecord:'Approval of narrower claim',withdrawRecord:'Evidence withdrawal',
  original:'Original record (unchanged)',reasonRequired:'Please enter a reason first.',saved:'Saved. Original records remain.',
  actionFailed:'Action was not saved. Enter a reason and check that evidence is active. Original records were not deleted.',
};
export function copyFor(lang){return lang==='en'?en:zh;}
const translations=new Map([
  ['所有格式都兼容','All formats are supported'],
  ['已验证UTF-8 CSV','Verified for UTF-8 CSV'],
  ['虚构验证：UTF-8 CSV读入','Fictional check: importing UTF-8 CSV'],
  ['本地自拟 fixture-source.csv；非真实产品测试','Locally invented fixture-source.csv; not a real product test'],
  ['仅演示一份UTF-8 CSV；未测XLSX、其他编码或任意文件。','One UTF-8 CSV is demonstrated; XLSX, other encodings and arbitrary files were not tested.'],
  ['本地操作人（身份未核验）','Local operator (identity not verified)'],
  ['虚构演示人工核对：范围仅限UTF-8 CSV，不承诺其他格式','Fictional demonstration, human scope check: limited to UTF-8 CSV; no claim is made about other formats.'],
  ['虚构演示：撤回证据，检查已有审核失效及历史保留','Fictional demonstration: withdraw evidence to check that the prior approval no longer applies and history is retained.'],
]);
export function recordText(value,lang){return lang==='en'?(translations.get(value)??value):value;}
export function assessmentText(assessment,lang,hasClaim=true){
  if(lang!=='en') return {label:assessment.label,reason:assessment.reason};
  const labels={unknown:'Unconfirmed',needs_review:'Needs review',counterevidence:'Counterevidence — human judgment required',scope_gap:'Scope gap',reviewed_supported:'Reviewed within limited scope',supported_pending_review:'Matching scope — human review pending'};
  const reasons={
    unknown:hasClaim?'No evidence can be checked; this does not mean the claim is disproven.':'No claim recorded.',
    needs_review:'Linked evidence has been withdrawn. The prior approval remains in history but no longer supports the current wording.',
    counterevidence:'Evidence is explicitly marked as contradicting the claim. The system does not automatically declare the whole claim false.',
    scope_gap:'The evidence covers only UTF-8 CSV, not “all formats”. Check the scope and narrow the wording.',
    reviewed_supported:'A human action confirmed the scoped claim and its referenced evidence. This does not prove compatibility with all formats.',
    supported_pending_review:'The scope fields match, but no human review decision has been recorded.',
  };
  return {label:labels[assessment.code]??'Unconfirmed',reason:reasons[assessment.code]??'No display translation is available for this assessment; inspect the original response.'};
}
export function countText(state,lang){return lang==='en'?`${state.claims.length} claim versions / ${state.evidence.length} original evidence record / ${state.decisions.length} review decisions`:`${state.claims.length} 个声明版本 / ${state.evidence.length} 条原证据 / ${state.decisions.length} 条处理决定`;}

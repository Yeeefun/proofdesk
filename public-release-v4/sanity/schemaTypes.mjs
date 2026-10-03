const required = Rule => Rule.required();
const strings = (name,title) => ({name,title,type:'array',of:[{type:'string'}],validation:Rule=>Rule.required().min(1)});
const refs = (name,title,type) => ({name,title,type:'array',of:[{type:'reference',to:[{type}]}]});
const created = {name:'createdAt',title:'记录时间',type:'datetime',validation:required};
export const schemaTypes=[
  {name:'claim',title:'声明版本',type:'document',fields:[
    {name:'text',title:'声明文字',type:'string',validation:required},
    {name:'version',title:'版本',type:'number',validation:Rule=>Rule.required().integer().min(1)},
    strings('formats','明确的格式范围（*为任意）'),strings('encodings','明确的编码范围（*为任意）'),
    refs('evidenceRefs','所用证据','evidence'),
    {name:'previousClaim',title:'原声明版本',type:'reference',to:[{type:'claim'}]},created
  ]},
  {name:'evidence',title:'证据原记录',type:'document',fields:[
    {name:'title',title:'证据标题',type:'string',validation:required},
    strings('formats','实际覆盖格式'),strings('encodings','实际覆盖编码'),
    {name:'result',title:'明确记录的结果',type:'string',options:{list:[{title:'支持限定范围',value:'supports'},{title:'有反证，需人工判断',value:'contradicts'}]},validation:required},
    {name:'source',title:'出处与虚构标记',type:'string',validation:required},
    {name:'detail',title:'观察与边界',type:'text',validation:required},created
  ]},
  {name:'reviewDecision',title:'审核/撤回决定',type:'document',fields:[
    {name:'action',title:'操作',type:'string',options:{list:[{title:'审核限定表述',value:'approve'},{title:'撤回证据',value:'withdraw'}]},validation:required},
    {name:'claimRef',title:'当时声明',type:'reference',to:[{type:'claim'}],validation:required},
    {...refs('evidenceRefs','当时关联证据','evidence'),validation:Rule=>Rule.required().min(1)},
    {name:'reason',title:'理由',type:'text',validation:Rule=>Rule.required().min(1).max(500)},
    {name:'actor',title:'操作人说明（非认证证明）',type:'string',validation:required},created
  ]}
];

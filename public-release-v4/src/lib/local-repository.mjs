import { mkdir,readFile,writeFile,rename } from 'node:fs/promises';
import path from 'node:path';
import {seedState,validateState,applyAction} from './core.mjs';
export function localRepository(directory=path.resolve('.local')) {
  const filename=path.join(directory,'state.json'); let queue=Promise.resolve();
  async function load() { try {return validateState(JSON.parse(await readFile(filename,'utf8')));} catch(e) {if(e.code==='ENOENT') return seedState(); throw new Error('本地数据无法读取；未替换为演示数据。请检查 .local/state.json');} }
  async function save(state) {validateState(state);await mkdir(directory,{recursive:true});const tmp=filename+'.tmp';await writeFile(tmp,JSON.stringify(state,null,2),'utf8');await rename(tmp,filename);return state;}
  return {load,async update(input){const operation=queue.then(async()=>save(applyAction(await load(),input)));queue=operation.catch(()=>{});return operation;},save};
}

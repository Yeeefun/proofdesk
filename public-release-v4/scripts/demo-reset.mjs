import {mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {localRepository} from '../src/lib/local-repository.mjs';
import {seedState} from '../src/lib/core.mjs';
if(process.argv[2]!=='--confirm-demo-only'){console.error('只重置自拟演示，必须传入 --confirm-demo-only；原本地文件先归档。');process.exit(2);}
const dir=path.resolve('.local');await mkdir(path.join(dir,'archive'),{recursive:true});
try {await copyFile(path.join(dir,'state.json'),path.join(dir,'archive',Date.now()+'-'+randomUUID()+'.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
await localRepository(dir).save(seedState());console.log('已重置自拟演示。之前的本地文件（如有）已归档，云端未改。');

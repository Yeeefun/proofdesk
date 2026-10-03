import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});
const core=await readFile('src/lib/core.mjs','utf8');
const portable=core.replace("import { randomUUID } from 'node:crypto';","const randomUUID=()=>crypto.randomUUID();");
if(portable===core)throw Error('Expected core import not found');
await writeFile('dist/server/core.mjs',portable);
await copyFile('scripts/worker-source.mjs','dist/server/index.js');
// Public builds need no account-specific Sites deployment identity.
console.log('Bilingual client and read-only cloud worker built.');

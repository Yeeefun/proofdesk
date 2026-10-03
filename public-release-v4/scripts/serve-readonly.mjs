import http from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {handle} from '../dist/server/index.js';

const defaultRoot=fileURLToPath(new URL('../dist/client/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.csv':'text/csv; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
const inside=(root,target)=>{const relative=path.relative(root,target);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));};
function safePath(raw){
  let decoded;
  try{decoded=decodeURIComponent(raw.split('?')[0]);}catch{return false;}
  return decoded.startsWith('/')&&!/[\\\x00:]/.test(decoded)&&!decoded.split('/').some(p=>p==='.'||p==='..');
}
export async function createReadOnlyServer({assetRoot=defaultRoot,fetcher=fetch,env={}}={}){
  const root=await realpath(assetRoot);
  const assets={async fetch(request){
    const pathname=new URL(request.url).pathname;
    if(!safePath(pathname))return new Response('Forbidden',{status:403});
    const target=path.resolve(root,'.'+decodeURIComponent(pathname));
    if(!inside(root,target))return new Response('Forbidden',{status:403});
    try{
      const resolved=await realpath(target);
      if(!inside(root,resolved))return new Response('Forbidden',{status:403});
      const info=await stat(resolved);
      if(!info.isFile())return new Response('Not found',{status:404});
      const headers={'Content-Type':mime[path.extname(resolved)]||'application/octet-stream','Content-Length':String(info.size),'X-Content-Type-Options':'nosniff'};
      return new Response(request.method==='HEAD'?null:await readFile(resolved),{headers});
    }catch{return new Response('Not found',{status:404});}
  }};
  // Only these public selectors are forwarded. No .env loader or auth token.
  const publicEnv={ASSETS:assets,...Object.fromEntries(['SANITY_PROJECT_ID','SANITY_DATASET','SANITY_API_VERSION'].filter(k=>typeof env[k]==='string').map(k=>[k,env[k]]))};
  const server=http.createServer(async(req,res)=>{
    try{
      if(req.method!=='GET'&&req.method!=='HEAD'){
        res.writeHead(403,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Read-only public demo'}));return;
      }
      if(!safePath(req.url||'/')){res.writeHead(403);res.end('Forbidden');return;}
      const request=new Request(new URL(req.url,`http://127.0.0.1:${server.address().port}`),{method:req.method});
      const result=await handle(request,publicEnv,fetcher);
      res.writeHead(result.status,Object.fromEntries(result.headers));
      res.end(req.method==='HEAD'?undefined:Buffer.from(await result.arrayBuffer()));
    }catch{
      res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify({error:'Read failed; no fixture fallback'}));
    }
  });
  server.on('connect',(_request,socket)=>socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'));
  server.on('upgrade',(_request,socket)=>socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'));
  server.requestTimeout=15000;
  return server;
}
export async function startReadOnlyServer({port=4321,...options}={}){
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid loopback port');
  const server=await createReadOnlyServer(options);
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const server=await startReadOnlyServer({port:Number(process.env.PORT||4321),env:process.env});
  console.log(`Read-only ProofDesk: http://127.0.0.1:${server.address().port}/en/`);
}

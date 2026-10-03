import path from 'node:path';
if(process.env.PROOFDESK_SKIP_ENV_FILE!=='1') {
  try {process.loadEnvFile(path.resolve('.env'));} catch(e) {if(e.code!=='ENOENT') throw new Error('本地.env无法读取，请检查配置文件');}
}

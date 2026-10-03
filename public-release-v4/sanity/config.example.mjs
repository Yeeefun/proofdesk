// 此文件是供已有Studio采用的配置样例；sanity Studio本轮未安装/启动。
import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './schemaTypes.mjs';
export default defineConfig({name:'proofdesk',title:'ProofDesk · 虚构演示',projectId:process.env.SANITY_PROJECT_ID,dataset:process.env.SANITY_DATASET,plugins:[structureTool()],schema:{types:schemaTypes}});

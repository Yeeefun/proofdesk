import './env.mjs';
import {localRepository} from './local-repository.mjs';
import {sanityRepository} from './sanity-repository.mjs';
export const mode=process.env.PROOFDESK_MODE==='sanity'?'sanity':'local';
let repository;
export function getRepository() {return repository??=(mode==='sanity'?sanityRepository(process.env):localRepository());}

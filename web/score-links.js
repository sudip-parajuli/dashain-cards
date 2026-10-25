import {validServer} from './online.js';
export function scoreShareUrl(server,code){if(!/^\d{6}$/.test(String(code)))throw Error('Invalid score code.');return validServer(server)+'#scores='+code;}
export function scoreCodeFromHash(hash){return /^#scores=(\d{6})$/.exec(hash)?.[1]??null;}

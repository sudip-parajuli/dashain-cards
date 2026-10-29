import {validateScoreRules} from '../web/score-rules.js';
import {randomBytes,randomInt} from 'node:crypto';
import {GAME_LIST} from '../web/core.js';
export function scoreRecord(value){
 if(!value||!GAME_LIST.some(g=>g.id===value.game)||!Array.isArray(value.names)||value.names.length<2||value.names.length>17||value.names.some(n=>typeof n!=='string'||!n.trim()||n.length>24)||new Set(value.names.map(n=>n.trim().toLowerCase())).size!==value.names.length)throw Error('Choose valid, unique player names.');
 if(!value.rules||typeof value.rules!=='object'||Array.isArray(value.rules)||!Array.isArray(value.rounds)||value.rounds.length>1000)throw Error('Invalid score record.');
 let nodes=0;function safe(v,depth=0){if(++nodes>50000||depth>12)throw Error('Score record is too large.');if(v===null||typeof v==='boolean')return;if(typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1e9)return;if(typeof v==='string'&&v.length<=500)return;if(Array.isArray(v)){for(const x of v)safe(x,depth+1);return;}if(v&&typeof v==='object'){for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Invalid record key.');safe(x,depth+1);}return;}throw Error('Invalid score value.');}
 const record={game:value.game,names:value.names.map(n=>n.trim()),rules:validateScoreRules(value.rules),rounds:value.rounds.map(r=>({scores:r.scores,data:r.data??null,note:r.note??'',...(r.foulPayments?{foulPayments:r.foulPayments}:{})})),playTable:!!value.playTable};safe(record);
 for(const r of record.rounds)if(!Array.isArray(r.scores)||r.scores.length!==record.names.length||r.scores.some(n=>!Number.isFinite(n)||Math.abs(n)>1e8)||typeof r.note!=='string'||r.note.length>180)throw Error('Invalid round scores.');
 return structuredClone(record);
}
export class ScoreStore{
 constructor(){this.records=new Map();}
 member(name){if(typeof name!=='string'||!name.trim()||name.trim().length>24)throw Error('Enter your name (1–24 characters).');return {id:randomBytes(8).toString('hex'),name:name.trim(),token:randomBytes(32).toString('hex')};}
 create(name,record,forcedCode=null){this.cleanup();if(this.records.size>=200)throw Error('Score sharing capacity reached.');const data=scoreRecord(record),member=this.member(name);let code=forcedCode;if(code!==null){if(!/^[1-9][0-9]{5}$/.test(code)||this.records.has(code))throw Error('Score code unavailable.');}else do{code=String(randomInt(100000,1000000));}while(this.records.has(code));this.records.set(code,{code,record:data,members:[member],owner:member.id,revision:0,updated:Date.now()});return {code,token:member.token};}
 get(code){const r=this.records.get(code);if(!r)throw Error('Shared score record not found or expired.');return r;}
 authorize(r,token){const m=r.members.find(m=>m.token===token);if(!m)throw Error('Score record access denied.');return m;}
 join(code,name){const r=this.get(code);if(r.members.length>=64)throw Error('This score record has reached its viewer limit.');const m=this.member(name);r.members.push(m);r.revision++;r.updated=Date.now();return {code,token:m.token};}
 view(code,token){const r=this.get(code),m=this.authorize(r,token);r.updated=Date.now();return {code,owner:r.owner===m.id,ownerId:r.owner,viewer:m.id,members:r.members.map(({id,name})=>({id,name})),record:structuredClone(r.record),revision:r.revision};}
 action(code,token,action,revision){const r=this.get(code),m=this.authorize(r,token);if(r.owner!==m.id)throw Error('Only the score owner can make changes.');if(revision!==r.revision)throw Error('The score record changed. Refresh and try again.');if(action?.type==='update'){const record=scoreRecord(action.record);if(record.game!==r.record.game||record.names.length!==r.record.names.length)throw Error('Keep the same game and players for this record.');r.record=record;}else if(action?.type==='transfer'){if(action.member===r.owner||!r.members.some(m=>m.id===action.member))throw Error('Choose another joined viewer.');r.owner=action.member;}else throw Error('Invalid score action.');r.revision++;r.updated=Date.now();return this.view(code,token);}
 cleanup(){const cutoff=Date.now()-30*24*60*60*1000;for(const [code,r]of this.records)if(r.updated<cutoff)this.records.delete(code);}
}

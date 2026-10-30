// Run only against an isolated local worker. No production load testing.
import assert from 'node:assert/strict';import {legalCards} from '../web/core.js';import {validateRoom} from '../web/online.js';
const base=process.argv[2]||'http://127.0.0.1:4299/dashaincards';assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+\/dashaincards$/);
async function api(path,data,token){const r=await fetch(base+'/api/rooms'+path,{method:data?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined});const v=await r.json();assert.ok(r.ok,v.error);return validateRoom(v);}
const host=await api('',{name:'Match QA 1',options:{game:'callbreak',players:4,eightEnabled:false,circleRestart:false}}),seats=[host];for(let p=1;p<4;p++)seats.push(await api('/'+host.code+'/join',{name:'Match QA '+(p+1)}));let v=await api('/'+host.code+'/action',{revision:3,action:{type:'start'}},host.token),hands=[];
async function move(p,action){v=await api('/'+host.code+'/action',{revision:v.revision,action},seats[p].token);}
for(let round=0;round<5;round++){hands=[];for(let p=0;p<4;p++){const own=await api('/'+host.code,null,seats[p].token);hands.push(own.game.hand[p]);for(let q=0;q<4;q++)if(q!==p)assert.ok(own.game.hand[q].every(c=>c===null));}
 for(let i=0;i<4;i++)await move(v.game.turn,{type:'bid',bid:1});while(v.game.phase==='play'){const p=v.game.turn,c=legalCards(hands[p],v.game.trick)[0];await move(p,{type:'play',id:c.id});hands[p]=hands[p].filter(x=>x.id!==c.id);}
 assert.equal(v.game.callMatch.rounds.length,round+1);if(round<4){assert.equal(v.game.over,false);assert.deepEqual(v.balances,[1000,1000,1000,1000]);await move(0,{type:'nextcallround'});}}
assert.equal(v.game.over,true);assert.equal(v.balances.reduce((a,b)=>a+b),4000);assert.equal(v.game.chipChanges.reduce((a,b)=>a+b),0);console.log('Actual workerd five-round Call Break match passed: private hands, round advancement and one final settlement.');

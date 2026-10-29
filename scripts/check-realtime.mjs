// Run against an isolated Wrangler local runtime, never a production URL.
import assert from 'node:assert/strict';
import {validateRoom} from '../web/online.js';
const base=process.argv[2]||'http://127.0.0.1:4299/dashaincards';
assert.ok(/^http:\/\/(127\.0\.0\.1|localhost):\d+\/dashaincards$/.test(base),'Local test target required');
async function api(path,body,token){const r=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,value:await r.json()};}
async function feed(kind,auth){const socket=new WebSocket(base.replace('http:','ws:')+'/api/'+kind+'/'+auth.code+'/events',['dashain-v1','auth.'+auth.token]),values=[];let waiting;socket.addEventListener('message',e=>{if(e.data==='pong')return;const v=JSON.parse(e.data).value;values.push(v);waiting?.();});await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});return {socket,async revision(n){const end=Date.now()+10000;while(!values.some(v=>v.revision===n)){if(Date.now()>end)throw Error('Missing live revision '+n);await new Promise(r=>{waiting=r;setTimeout(r,50);});}return values.find(v=>v.revision===n);}};}
const host=(await api('rooms',{name:'Hari',options:{game:'jutpatti',players:2}})).value;
const guest=(await api('rooms/'+host.code+'/join',{name:'Sita'})).value;
const h=await feed('rooms',host),g=await feed('rooms',guest);
const start=await api('rooms/'+host.code+'/action',{revision:1,action:{type:'start'}},host.token);assert.equal(start.status,200);
const hv=await h.revision(2),gv=await g.revision(2);assert.ok(hv.game.hand[1].every(c=>c===null));assert.ok(gv.game.hand[0].every(c=>c===null));assert.ok(gv.game.hand[1].every(Boolean));
const auth=[host,guest][hv.game.turn],move={revision:2,action:{type:'draw',source:'stock'}};
const race=await Promise.all([api('rooms/'+host.code+'/action',move,auth.token),api('rooms/'+host.code+'/action',move,auth.token)]);assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);await h.revision(3);await g.revision(3);
const record={game:'marriage',names:['Hari','Sita'],rules:{seen:3,unseen:10},rounds:[]};
const owner=(await api('scores',{name:'Hari',record})).value,viewer=(await api('scores/'+owner.code+'/join',{name:'Sita'})).value,s=await feed('scores',viewer);
assert.equal((await api('scores/'+owner.code+'/action',{revision:1,action:{type:'update',record}},viewer.token)).status,403);
record.rules.seen=4;assert.equal((await api('scores/'+owner.code+'/action',{revision:1,action:{type:'update',record}},owner.token)).status,200);assert.equal((await s.revision(2)).record.rules.seen,4);
const kh=(await api('rooms',{name:'Kitti host',options:{game:'kitti',players:2,revealDirection:'anticlockwise'}})).value;
const kv=(await api('rooms/'+kh.code+'/join',{name:'Kitti guest'})).value,ks=await feed('rooms',kv),players=[kh,kv];
let state=(await api('rooms/'+kh.code+'/action',{revision:1,action:{type:'start'}},kh.token)).value;
for(let p=0;p<2;p++){const own=(await api('rooms/'+kh.code,null,players[p].token)).value.game.hand[p];for(let set=0;set<2;set++){const result=await api('rooms/'+kh.code+'/action',{revision:state.revision,action:{type:'group',ids:own.slice(set*3,set*3+3).map(c=>c.id)}},players[p].token);assert.equal(result.status,200);state=result.value;}}
assert.equal(state.game.phase,'showdown');assert.equal(state.game.over,false);assert.equal(state.game.groups.length,3);assert.equal((await api('rooms/'+kh.code+'/action',{revision:state.revision,action:{type:'reveal',set:2}},players[state.game.turn].token)).status,400);
for(let i=0;i<12&&!state.game.over;i++){const seat=state.game.turn,result=await api('rooms/'+kh.code+'/action',{revision:state.revision,action:{type:'reveal',set:state.game.showdown.round+(state.game.showdown.awaitingNext?1:0)}},players[seat].token);assert.equal(result.status,200);state=validateRoom(result.value);const pushed=await ks.revision(state.revision);validateRoom(pushed);if(!state.game.over){assert.equal(pushed.game.allGroups,null);if(pushed.game.showdown.round<2||!pushed.game.showdown.revealed.includes(0))assert.equal(pushed.game.showdownGroups[0][2],null);}}
assert.equal(state.game.over,true);assert.equal(state.game.showdown.roundWinners.length,3);
await Promise.all([h,g,s,ks].map(f=>new Promise(resolve=>{f.socket.addEventListener('close',resolve,{once:true});f.socket.close(1000);setTimeout(resolve,2000).unref();})));
console.log('Actual workerd WebSocket checks passed: private hand filtering, live revisions, concurrent move conflict, read-only scores and three-stage Kitti reveals.');

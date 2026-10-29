// Run against an isolated Wrangler local runtime, never a production URL.
import assert from 'node:assert/strict';
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
await Promise.all([h,g,s].map(f=>new Promise(resolve=>{f.socket.addEventListener('close',resolve,{once:true});f.socket.close(1000);setTimeout(resolve,2000).unref();})));
console.log('Actual workerd WebSocket checks passed: private hand filtering, live revisions, concurrent move conflict, read-only score permissions and score push.');

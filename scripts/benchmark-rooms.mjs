// Deterministic scope: in-process stores/coordinators, not Cloudflare capacity certification.
import assert from 'node:assert/strict';
import {RoomCoordinator} from '../deploy/cloudflare/coordinator.mjs';
const objects=[],seats=[],started=performance.now();let writes=0;
for(let i=0;i<250;i++){
 let ready,alarm=null;const data=new Map(),ctx={blockConcurrencyWhile(fn){ready=fn();},storage:{async list(){return new Map(data);},async put(k,v){writes++;data.set(k,structuredClone(v));},async delete(k){data.delete(k);},async getAlarm(){return alarm;},async setAlarm(n){alarm=n;}}};
 const object=new RoomCoordinator(ctx);await ready;
 const call=async(path,body,token)=>{const r=await object.fetch(new Request('https://test/api/rooms'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),'CF-Connecting-IP':'192.0.2.'+(i%250+1)},body:body?JSON.stringify(body):undefined}));assert.equal(r.status,body&&!path?201:200);return r.json();};
 const host=await call('',{name:'Hari',options:{game:'jutpatti',players:4}}),players=[host];
 for(const name of ['Sita','Gopal','Laxmi'])players.push(await call('/'+host.code+'/join',{name}));
 await call('/'+host.code+'/action',{revision:3,action:{type:'start'}},host.token);
 objects.push({call,code:host.code});seats.push(...players.map(p=>({call,code:host.code,token:p.token})));
}
const setupMs=performance.now()-started,latencies=[],before=writes;
for(let batch=0;batch<10;batch++)await Promise.all(Array.from({length:300},async(_,n)=>{const p=seats[(batch*300+n)%seats.length],t=performance.now(),v=await p.call('/'+p.code,null,p.token);assert.equal(v.revision,4);latencies.push(performance.now()-t);}));
assert.equal(writes,before,'Read bursts must not rewrite stored games');latencies.sort((a,b)=>a-b);
console.log(JSON.stringify({scope:'In-process Node coordinator benchmark; no network or Cloudflare scheduling',rooms:objects.length,players:seats.length,concurrentReads:300,totalReads:latencies.length,errors:0,setupMs:Math.round(setupMs),p50Ms:+latencies[Math.floor(latencies.length*.5)].toFixed(2),p95Ms:+latencies[Math.floor(latencies.length*.95)].toFixed(2),p99Ms:+latencies[Math.floor(latencies.length*.99)].toFixed(2),readBurstStorageWrites:writes-before},null,2));

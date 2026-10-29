import test from 'node:test';
import assert from 'node:assert/strict';
import {readJSON} from '../server/request.mjs';
import {validateScoreRules} from '../web/score-rules.js';
import {RoomCoordinator} from '../deploy/cloudflare/coordinator.mjs';
import worker from '../deploy/cloudflare/worker.mjs';
import {customLegacyPreset} from '../web/play-preferences.js';
import {effectivePointRules} from '../web/point-rules.js';
test('Retired preset migrates to custom rules without changing saved point values',()=>{const old={scoringProfile:'bhoos',seen:4},before=structuredClone(old),custom=customLegacyPreset(old);assert.equal(custom.scoringProfile,'classic');assert.equal(custom.seen,4);assert.deepEqual(effectivePointRules(custom),effectivePointRules(old));assert.deepEqual(old,before);});
test('Streaming request limits count bytes without trusting Content-Length',async()=>{
 const request=text=>new Request('https://test',{method:'POST',body:new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(text));c.close();}}),duplex:'half'});
 await assert.rejects(readJSON(request('{"a":"'+ 'अ'.repeat(30)+'"}'),40),/large/);
 await assert.rejects(readJSON(request('{bad}')),/Invalid JSON/);
 await assert.rejects(readJSON(request('[]')),/object/);
 assert.deepEqual(await readJSON(request('{"a":2}')),{a:2});
});
test('Shared rules reject markup, nested payloads and prototype keys',()=>{
 for(const rules of [{seen:'<img src=x onerror=alert(1)>'},{pointRate:Infinity},{seen:{}},JSON.parse('{"__proto__":{"x":1}}')])assert.throws(()=>validateScoreRules(rules));
 assert.equal(validateScoreRules({seen:3,unseen:10,scoringProfile:'nepal'}).seen,3);
});
function namespace(){const instances=new Map(),storage=new Map();return {instances,storage,idFromName:n=>n,get(id){if(!instances.has(id)){const data=storage.get(id)||new Map();storage.set(id,data);let ready,alarm=null;const ctx={blockConcurrencyWhile(fn){ready=fn();},storage:{async list(){return new Map(data);},async put(k,v){data.set(k,structuredClone(v));},async delete(k){data.delete(k);},async getAlarm(){return alarm;},async setAlarm(n){alarm=n;}}};const object=new RoomCoordinator(ctx,{ROOMS:this});instances.set(id,{async fetch(req){await ready;return object.fetch(req);}});}return instances.get(id);}};}
test('Worker isolates rooms and preserves legacy credentials during lazy migration',async()=>{
 const rooms=namespace(),env={ROOMS:rooms};
 const old=await(await rooms.get('dashain-preview-v1').fetch(new Request('https://internal/api/rooms',{method:'POST',body:JSON.stringify({name:'Hari',options:{players:2}})}))).json();
 const res=await worker.fetch(new Request('https://host/dashaincards/api/rooms/'+old.code,{headers:{Authorization:'Bearer '+old.token}}),env);
 assert.equal(res.status,200);assert.equal((await res.json()).code,old.code);assert.ok(rooms.storage.get('rooms:'+old.code).has('room:'+old.code));
 const made=await(await worker.fetch(new Request('https://host/dashaincards/api/rooms',{method:'POST',headers:{'x-dashain-scope':'rooms:111111'},body:JSON.stringify({name:'Sita',options:{players:2}})}),env)).json();
 assert.ok(rooms.storage.get('rooms:'+made.code).has('room:'+made.code));assert.notEqual(made.code,old.code);
 assert.equal((await worker.fetch(new Request('https://host/dashaincards/internal/export/rooms/'+old.code),{...env,ASSETS:{fetch:async()=>new Response('not found',{status:404})}})).status,404);
});

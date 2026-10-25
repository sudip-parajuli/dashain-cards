import {ScoreStore} from '../../server/scores.mjs';
import {RoomStore} from '../../server/rooms.mjs';
export class RoomCoordinator {
 constructor(ctx){this.ctx=ctx;this.store=new RoomStore();this.scores=new ScoreStore();this.rates=new Map();ctx.blockConcurrencyWhile(async()=>{const scores=await ctx.storage.list({prefix:'score:'});for(const [key,record]of scores)this.scores.records.set(key.slice(6),record);this.scores.cleanup();for(const key of scores.keys())if(!this.scores.records.has(key.slice(6)))await ctx.storage.delete(key);const saved=await ctx.storage.list({prefix:'room:'});for(const [key,room] of saved)this.store.rooms.set(key.slice(5),room);this.store.cleanup();for(const key of saved.keys())if(!this.store.rooms.has(key.slice(5)))await ctx.storage.delete(key);});}
 async fetch(req){
  const url=new URL(req.url),creating=req.method==='POST'&&(url.pathname==='/api/rooms'||url.pathname==='/api/scores'||url.pathname.endsWith('/join')),ip=req.headers.get('CF-Connecting-IP')||'local',now=Date.now(),rateKey=ip+':'+creating;
  let rate=this.rates.get(rateKey);if(!rate||now-rate.time>60000){rate={time:now,n:0};this.rates.set(rateKey,rate);}if(++rate.n>(creating?20:600))return Response.json({error:'Too many requests. Please wait a minute.'},{status:429});
  for(const [k,v] of this.rates)if(now-v.time>120000)this.rates.delete(k);
  try{
   const parse=async()=>{if(Number(req.headers.get('content-length')||0)>(url.pathname.startsWith('/api/scores')?256000:8192))throw Error('Request is too large.');const text=await req.text();if(text.length>(url.pathname.startsWith('/api/scores')?256000:8192))throw Error('Request is too large.');return JSON.parse(text||'{}');};
   let result,status=200,code;
   if(url.pathname.startsWith('/api/scores')){let code;if(req.method==='POST'&&url.pathname==='/api/scores'){const d=await parse();result=this.scores.create(d.name,d.record);code=result.code;status=201;}else{const match=/^\/api\/scores\/([0-9]{6})(?:\/(join|action))?$/.exec(url.pathname);if(!match)return Response.json({error:'Endpoint not found.'},{status:404});code=match[1];const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');if(req.method==='GET'&&!match[2])result=this.scores.view(code,token);else if(req.method==='POST'&&match[2]==='join'){const d=await parse();result=this.scores.join(code,d.name);}else if(req.method==='POST'&&match[2]==='action'){const d=await parse();result=this.scores.action(code,token,d.action,d.revision);}else return Response.json({error:'Method not allowed.'},{status:405});}await this.ctx.storage.put('score:'+code,this.scores.get(code));if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(now+3600000);return Response.json(result,{status,headers:{'Cache-Control':'no-store'}});}
   if(req.method==='POST'&&url.pathname==='/api/rooms'){const d=await parse();result=this.store.create(d.name,d.options);code=result.code;status=201;}
   else {const match=/^\/api\/rooms\/([0-9]{6})(?:\/(join|action))?$/.exec(url.pathname);if(!match)return Response.json({error:'Endpoint not found.'},{status:404});code=match[1];const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
    if(req.method==='POST'&&match[2]==='join'){const d=await parse();result=this.store.join(code,d.name);}
    else if(req.method==='GET'&&!match[2])result=this.store.view(code,token);
    else if(req.method==='POST'&&match[2]==='action'){const d=await parse();result=this.store.action(code,token,d.action,d.revision);}
    else return Response.json({error:'Method not allowed.'},{status:405});
   }
   // Save only the affected room, including seat authentication and last activity.
   await this.ctx.storage.put('room:'+code,this.store.get(code));
   if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(now+3600000);
   return Response.json(result,{status,headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:e.message},{status:e.message.includes('not found')?404:400,headers:{'Cache-Control':'no-store'}});}
 }
 async alarm(){const scores=[...this.scores.records.keys()];this.scores.cleanup();for(const code of scores)if(!this.scores.records.has(code))await this.ctx.storage.delete('score:'+code);const before=[...this.store.rooms.keys()];this.store.cleanup();for(const code of before)if(!this.store.rooms.has(code))await this.ctx.storage.delete('room:'+code);if(this.store.rooms.size||this.scores.records.size)await this.ctx.storage.setAlarm(Date.now()+3600000);}
}

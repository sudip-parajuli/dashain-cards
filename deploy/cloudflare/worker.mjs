import {FRIEND_GAMES} from '../../web/friends-games.js';
export {RoomCoordinator} from './coordinator.mjs';
export default {
 async fetch(req,env){const url=new URL(req.url),prefix='/dashaincards';
  if(url.pathname!==prefix&&!url.pathname.startsWith(prefix+'/'))return new Response('Not found',{status:404});
  const internal=new URL(url);internal.pathname=url.pathname.slice(prefix.length)||'/';
  if(!internal.pathname.startsWith('/api/')){if(internal.pathname==='/')internal.pathname='/index.html';const asset=await env.ASSETS.fetch(new Request(internal,req));const assetHeaders=new Headers(asset.headers);if(internal.pathname==='/sw.js')assetHeaders.set('Service-Worker-Allowed',prefix);if(asset.status===200&&asset.headers.get('content-type')?.includes('text/html')){assetHeaders.delete('content-length');return new Response((await asset.text()).replace('<head>','<head><base href="/dashaincards/">'),{status:asset.status,headers:assetHeaders});}return new Response(asset.body,{status:asset.status,headers:assetHeaders});}
  const origin=req.headers.get('origin'),allowed=['https://appassets.androidplatform.net',url.origin,...(env.ALLOWED_ORIGINS||'').split(',').filter(Boolean)];
  if(origin&&!allowed.includes(origin))return Response.json({error:'This app origin is not allowed.'},{status:403});
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'};if(origin){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';}
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(internal.pathname==='/api/health')return Response.json({ok:true,game:'marriage',games:Object.keys(FRIEND_GAMES)},{headers});
  const stub=env.ROOMS.get(env.ROOMS.idFromName('dashain-preview-v1'));const res=await stub.fetch(new Request(internal,req));const merged=new Headers(res.headers);for(const [k,v]of Object.entries(headers))merged.set(k,v);return new Response(res.body,{status:res.status,headers:merged});
 }
};

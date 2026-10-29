import {economyRules} from '../web/game-economy.js';
import {validatePointRules,pointDefaults} from '../web/point-rules.js';
import {randomBytes,randomInt} from 'node:crypto';
import {integer,DEFAULT_MARRIAGE,NEPAL_MARRIAGE,BHOOS_MARRIAGE} from '../web/core.js';
import {friendGame,friendPlayerCount} from '../web/friends-games.js';
import {otherRules,chipRules,roomType,startMultiplayer,moveMultiplayer,settleMultiplayer,multiplayerView} from './multiplayer.mjs';
function marriageOptions(options){const rules={...(options.scoringProfile==='bhoos'?BHOOS_MARRIAGE:options.scoringProfile==='nepal'?NEPAL_MARRIAGE:DEFAULT_MARRIAGE)};for(const k of ['seen','unseen','dublee','tunnelaPoints','alterPoints'])if(options[k]!==undefined)rules[k]=integer(Number(options[k]),0,1000);if(options.scoringProfile!==undefined){if(!['nepal','classic','bhoos'].includes(options.scoringProfile))throw Error('Invalid scoring preset.');rules.scoringProfile=options.scoringProfile;}if(options.unseenMaal!==undefined){if(!['murder','kidnap','count'].includes(options.unseenMaal))throw Error('Invalid unseen maal setting.');rules.unseenMaal=options.unseenMaal;}if(options.tunnelaTiming!==undefined){if(!['initial','any'].includes(options.tunnelaTiming))throw Error('Invalid tunnela rule.');rules.tunnelaTiming=options.tunnelaTiming;}for(const key of ['dubleeExempt','doubleEnabled','alter','printedJokers','masterEnabled','supermanEnabled','supermanInOpening'])if(options[key]!==undefined){if(typeof options[key]!=='boolean')throw Error('Invalid rule toggle.');rules[key]=options[key];}for(const [key,values] of [['maalTiming',['immediate','discard']],['tunnelaScale',['flat','rank']]])if(options[key]!==undefined){if(!values.includes(options[key]))throw Error('Invalid Marriage rule.');rules[key]=options[key];}rules.initialChips=integer(Number(options.initialChips??1000),1,1000000);rules.chipValue=Number(options.chipValue??1);if(!Number.isFinite(rules.chipValue)||rules.chipValue<0||rules.chipValue>100000||Math.abs(rules.chipValue*100-Math.round(rules.chipValue*100))>0.00001)throw Error('Choose a valid chip value.');rules.pointRules=options.pointRules!==undefined?validatePointRules(options.pointRules,rules.scoringProfile||'classic'):pointDefaults(rules.scoringProfile||'classic');return rules;}
export class RoomStore{
 constructor(){this.rooms=new Map();}
 credentials(){return randomBytes(32).toString('hex');}
 player(name){if(typeof name!=='string'||!name.trim()||name.trim().length>24)throw Error('Enter a name of 1–24 characters.');return {name:name.trim(),token:this.credentials(),lastSeen:Date.now()};}
 create(name,options={},forcedCode=null){
  this.cleanup();if(this.rooms.size>=200)throw Error('Room capacity reached. Try later.');if(!options||typeof options!=='object'||Array.isArray(options))throw Error('Choose valid room rules.');
  const type=options.game??'marriage',meta=friendGame(type),players=friendPlayerCount(type,Number(options.players??meta.default)),rules={...(type==='marriage'?marriageOptions(options):otherRules({...options,game:type})),...chipRules(options),...(options.economyVersion===2||options.coinsPerPoint!==undefined||(type!=='faras'&&options.boot!==undefined)?economyRules(type,options):{}),game:type,players};
  if(rules.boot&&rules.initialChips<rules.boot)throw Error('Starting chips must cover the boot.');
  let code=forcedCode;if(code!==null){if(!/^[1-9][0-9]{5}$/.test(code)||this.rooms.has(code))throw Error('Room code unavailable.');}else do{code=String(randomInt(100000,1000000));}while(this.rooms.has(code));
  const p=this.player(name?.trim()?name:'Player 1'),room={code,gameType:type,players,options:rules,seats:[p],owner:p.token,game:null,revision:0,round:0,totals:Array(players).fill(0),balances:Array(players).fill(rules.initialChips),chipTotals:Array(players).fill(0),updated:Date.now()};this.rooms.set(code,room);return {code,token:p.token};
 }
 get(code){const r=this.rooms.get(String(code).toUpperCase());if(!r)throw Error('Room not found or expired.');return r;}
 authorize(room,token){const p=room.seats.findIndex(p=>p.token===token);if(p<0)throw Error('Room access denied.');room.seats[p].lastSeen=Date.now();room.updated=Date.now();return p;}
 join(code,name){const room=this.get(code);if(room.game)throw Error('The game has already started. Resume using your saved seat.');if(room.seats.length>=room.players)throw Error('This room is full.');const p=this.player(name?.trim()?name:'Player '+(room.seats.length+1));if(room.seats.some(s=>s.name===p.name))throw Error('That name is already at the table.');room.seats.push(p);room.revision++;room.updated=Date.now();return {code:room.code,token:p.token};}
 view(code,token){const r=this.get(code),me=this.authorize(r,token);r.balances??=r.totals.map(()=>r.options.initialChips??1000);r.chipTotals??=r.totals.map(()=>0);return {code:r.code,gameType:roomType(r),viewer:me,owner:r.owner===token,players:r.players,seats:r.seats.map(p=>({name:p.name,online:Date.now()-p.lastSeen<30000})),revision:r.revision,round:r.round,totals:r.totals,balances:r.balances.slice(0,r.seats.length),chipTotals:r.chipTotals.slice(0,r.seats.length),options:r.options,game:r.game?this.gameView(r,me):null};}
 gameView(r,p){return multiplayerView(r,p);}
 action(code,token,action,revision){const before=structuredClone(this.get(code));try{return this.applyAction(code,token,action,revision);}catch(e){this.rooms.set(String(code),before);throw e;}}
 applyAction(code,token,action,revision){
  const r=this.get(code),p=this.authorize(r,token);if(revision!==r.revision)throw Error('The table changed. Refresh and try again.');if(!action||typeof action!=='object'||Array.isArray(action)||typeof action.type!=='string')throw Error('Choose a valid table action.');
  if(action.type==='rename'){const name=this.player(action.name).name;if(r.seats.some((s,i)=>i!==p&&s.name.toLowerCase()===name.toLowerCase()))throw Error('That name is already at the table.');r.seats[p].name=name;if(r.game)r.game.names=r.seats.map(s=>s.name);
  }else if(action.type==='start'||action.type==='nextdeal'){
   if(token!==r.owner)throw Error('Only the host can deal.');if(r.game&&!r.game.over)throw Error('The current deal is still in progress.');startMultiplayer(r);
  }else{
   const g=r.game;if(!g||g.over)throw Error('There is no active deal.');if(g.turn!==p&&!(g.type==='faras'&&action.type==='look'))throw Error('Wait for your turn.');
   if(['discard','group'].includes(action.type)||(g.type==='marriage'&&action.type==='show')){const ids=action.ids;if(!Array.isArray(ids)||ids.length>22||ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)throw Error('Choose valid cards.');}
   if(action.type==='play'&&(typeof action.id!=='string'||action.id.length>20))throw Error('Choose a card in your hand.');
   moveMultiplayer(g,p,action);const verb={draw:action.source==='pile'?'took the discard':'drew from the stock',discard:'discarded',show:g.type==='faras'?'requested a show':'showed an opening',finish:'finished the deal',drawDiscard:'drew and discarded',play:'played a card',bid:'called '+action.bid,look:'looked at their cards',bet:'bet',raise:'raised',fold:'packed',reveal:'revealed a Kitti set',group:'set a private hand',resetgroups:'reset their split'}[action.type];g.lastMove=r.seats[p].name+' '+verb+'.';
   if(g.over)settleMultiplayer(r);
  }
  r.revision++;r.updated=Date.now();return this.view(code,token);
 }
 cleanup(){const cutoff=Date.now()-6*60*60*1000;for(const [id,r]of this.rooms)if(r.updated<cutoff)this.rooms.delete(id);}
}


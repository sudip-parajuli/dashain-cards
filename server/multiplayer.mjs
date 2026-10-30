import {callRules,callReserve,nextCallRound} from '../web/callbreak-match.js';
import {beginKittiShowdown,publicKittiSets,completeKittiSplit} from '../web/kitti-showdown.js';
import {economyRules,settleGameEconomy} from '../web/game-economy.js';
import {friendGame,friendPlayerCount} from '../web/friends-games.js';
import {newGame,drawHuman,discardHuman,declareHuman,playTrickCard,resolveKitti,advanceKitti} from '../web/games.js';
import {normalizeExposures,marriageDraw,marriageDiscard,showMarriage,finishMarriage} from '../web/marriage.js';
import {daharPlay} from '../web/dahar.js';
import {farasLook,farasAction} from '../web/faras.js';
import {integer,threeRank,compare} from '../web/core.js';
import {settleTableChips} from '../web/table-chips.js';

export function otherRules(options){
 if(options.game==='callbreak')return callRules(options);
 const type=options.game,defaults={callbreak:{overtricks:true,roundLimit:5},dhumbal:{limit:5,penalty:25,faceValues:'ten',runs:false,jackZero:false},daharmara:{trump:'auto',teamCapture:false},kitti:{aceLowBest:false,anyTwo:false,revealDirection:'clockwise'},faras:{boot:2,turnCap:18,aceLowBest:true},jutpatti:{cards:5,wild:'auto'}}[type];
 if(!defaults)throw Error('Choose a supported game.');const rules={...defaults,winPoints:10};
 for(const [key,defaultValue] of Object.entries(rules))if(options[key]!==undefined){const v=options[key];if(typeof defaultValue==='boolean'){if(typeof v!=='boolean')throw Error('Invalid rule toggle.');rules[key]=v;}else if(typeof defaultValue==='number'){const bounds={roundLimit:[1,100],limit:[0,100],penalty:[0,1000],boot:[1,1000],turnCap:[3,100],winPoints:[1,1000],cards:[5,7]}[key];rules[key]=integer(Number(v),...bounds);if(key==='cards'&&![5,7].includes(rules[key]))throw Error('Choose five or seven cards.');}else{const allowed={revealDirection:['clockwise','anticlockwise'],faceValues:['ten','rank'],trump:['auto','S','H','D','C'],wild:['auto','above','below','same','none']}[key];if(!allowed.includes(v))throw Error('Invalid game rule.');rules[key]=v;}}
 if(rules.wild==='below')rules.wild='auto';return rules;
}
export function chipRules(options){const initialChips=integer(Number(options.initialChips??1000),1,1000000),chipValue=Number(options.chipValue??1);if(!Number.isFinite(chipValue)||chipValue<0||chipValue>100000||Math.abs(chipValue*100-Math.round(chipValue*100))>0.00001)throw Error('Choose a valid chip value.');return {initialChips,chipValue};}
export function roomType(r){return r.gameType||r.options.game||'marriage';}
export function startMultiplayer(r){
 const type=roomType(r),n=friendPlayerCount(type,r.seats.length);r.players=n;r.options.players=n;r.totals=r.totals.slice(0,n);r.balances??=Array(n).fill(r.options.initialChips??1000);r.chipTotals??=Array(n).fill(0);r.balances=r.balances.slice(0,n);r.chipTotals=r.chipTotals.slice(0,n);
 const minimum=type==='callbreak'?callReserve(r.options,n):type==='faras'||r.options.economyVersion===2&&!['marriage','callbreak','dhumbal'].includes(type)?r.options.boot:1;if(r.balances.some(b=>b<minimum))throw Error('A player has insufficient table chips. This table is finished.');
 const g=newGame(type,type==='faras'?{...r.options,chips:r.options.initialChips,startingBalances:r.balances}:r.options);g.options={...r.options};g.turn=type==='daharmara'?0:r.round%n;g.openingSeat=g.turn;g.dealer=(g.turn+n-1)%n;
 if(type==='kitti'){g.kittiGroups=g.hand.map(()=>[]);g.ready=g.hand.map(()=>false);}
 g.names=r.seats.map(s=>s.name);r.game=g;r.round++;
}
function chooseBid(g,p,bid){if(g.phase!=='bid')throw Error('Bidding has finished.');const max=g.deal.totalTricks;if(!Number.isInteger(bid))throw Error('Choose a whole-number call.');integer(bid,1,max);if(g.bids[p])throw Error('Your call is already recorded.');if(g.callMatch?.rules.eightEnabled&&bid===8&&g.bids.includes(8))throw Error('An 8-call is already active this round. Choose another call.');g.bids[p]=bid;if(g.bids.every(Boolean)){g.phase='play';g.turn=g.openingSeat;}else do{g.turn=(g.turn+1)%g.hand.length;}while(g.bids[g.turn]);}
function kittiMove(g,p,action){
 if(g.phase!=='split'||g.ready[p])throw Error('Your split is already submitted.');if(action.type==='resetgroups'){g.kittiGroups[p]=[];return;}
 const used=new Set(g.kittiGroups[p].flat().map(c=>c.id));if(action.ids.length!==3)throw Error('Select exactly three cards.');const cards=g.hand[p].filter(c=>action.ids.includes(c.id)&&!used.has(c.id));if(cards.length!==3)throw Error('Choose three unused cards.');g.kittiGroups[p].push(cards);g.kittiGroups[p]=completeKittiSplit(g.hand[p],g.kittiGroups[p]);
 if(g.kittiGroups[p].length===3){const low=g.options.aceLowBest;g.kittiGroups[p].sort((a,b)=>compare(threeRank(b,low),threeRank(a,low)));g.ready[p]=true;if(g.ready.every(Boolean))beginKittiShowdown(g,g.kittiGroups);else do{g.turn=(g.turn+1)%g.hand.length;}while(g.ready[g.turn]);}
}
export function moveMultiplayer(g,p,action){
 const type=g.type;
 if(type==='marriage'){
  if(action.type==='draw'){if(!['stock','pile'].includes(action.source))throw Error('Invalid draw source.');marriageDraw(g,p,action.source);}
  else if(action.type==='discard')marriageDiscard(g,p,action.ids);
  else if(action.type==='show')showMarriage(g,p,action.ids);
  else if(action.type==='finish')finishMarriage(g,p);
  else if(action.type==='drawDiscard'){const c=marriageDraw(g,p,'stock');marriageDiscard(g,p,[c.id]);}
  else throw Error('Unknown Marriage action.');
 }else if(type==='callbreak'){
  if(action.type==='bid')chooseBid(g,p,action.bid);else if(action.type==='play')playTrickCard(g,p,action.id);else throw Error('Choose a call or a legal card.');
 }else if(type==='daharmara'){
  if(action.type!=='play')throw Error('Play a legal card.');daharPlay(g,p,action.id);
 }else if(type==='faras'){
  if(action.type==='look')farasLook(g,p);else if(['bet','raise','show','fold'].includes(action.type))farasAction(g,p,action.type);else throw Error('Choose look, bet, raise, show or pack.');
 }else if(type==='kitti'){
  if(action.type==='reveal'){advanceKitti(g,p,action.set);return;}if(!['group','resetgroups'].includes(action.type))throw Error('Split your hand into three groups.');kittiMove(g,p,action);
 }else if(['dhumbal','jutpatti'].includes(type)){
  if(action.type==='draw'){if(!['stock','pile'].includes(action.source))throw Error('Invalid draw source.');drawHuman(g,action.source,p);}
  else if(action.type==='discard')discardHuman(g,action.ids,p);
  else if(action.type==='declare')declareHuman(g,p);
  else if(action.type==='drawDiscard'){const c=drawHuman(g,'stock',p);discardHuman(g,[c.id],p);}
  else throw Error('Choose draw, discard or declare.');
 }else throw Error('Choose a supported game.');
}
export function settleMultiplayer(r){
 const g=r.game;r.totals=r.totals.map((n,p)=>Math.round((n+g.scores[p])*1000000)/1000000);
 if(g.type==='callbreak'&&g.callMatch){const result=settleTableChips(r.balances,g.callMatch.transfers);r.balances=result.balances;g.chipChanges=result.changes;}
 else if(g.type==='faras'){r.balances=[...g.bank];g.chipChanges=g.bank.map((b,p)=>Math.round((b-g.startBank[p])*1000000)/1000000);}
 else if(r.options.economyVersion===2){const result=settleGameEconomy(g.type,r.balances,g.scores,r.options);r.balances=result.balances;g.chipChanges=result.changes;}
 else{
  let scores=g.scores;if(g.type!=='marriage'){
   const target=g.type==='dhumbal'?Math.min(...g.scores):Math.max(...g.scores),winners=g.scores.map((n,p)=>n===target?p:-1).filter(p=>p>=0),n=g.hand.length,stake=r.options.winPoints;
   scores=g.scores.map((_,p)=>winners.includes(p)?stake*(n-winners.length)/winners.length:-stake);
  }
  const result=settleTableChips(r.balances,scores);r.balances=result.balances;g.chipChanges=result.changes;
 }
 r.chipTotals=r.balances.map(b=>Math.round((b-(r.options.initialChips??1000))*1000000)/1000000);
}
export function multiplayerView(r,p){
 const g=r.game,n=g.hand.length;if(g.type==='marriage')normalizeExposures(g);const ownVisible=g.type!=='faras'||g.seen[p]||g.over;
 const view={type:g.type,options:g.options,hand:g.hand.map((h,i)=>(g.over||i===p&&ownVisible)?h.map(c=>({...c})):Array(h.length).fill(null)),stockCount:g.stock?.length??0,pile:g.pile?.length?[{...g.pile.at(-1)}]:[],tip:g.tip&&(g.type!=='marriage'||g.seen[p]||g.over)?{...g.tip}:null,exposed:(g.exposed||g.hand.map(()=>[])).map(h=>h.map(c=>({...c}))),turn:g.turn,phase:g.phase,over:g.over,scores:[...g.scores],selected:[],winner:g.over?g.winner:null,winners:g.over?g.winners:null,teamWinner:g.over?g.teamWinner:null,lastMove:g.lastMove||'',message:statusMessage(r),chipChanges:g.over?g.chipChanges:null};
 if(g.type==='marriage')Object.assign(view,{seen:[...g.seen],tunnelas:(g.tunnelas||g.hand.map(()=>[])).map(groups=>groups.map(h=>h.map(c=>({...c})))),recentDiscards:g.recentDiscards||[],openingGroups:(g.openingGroups||g.hand.map(()=>[])).map(groups=>groups.map(h=>h.map(c=>({...c})))),maalDetails:g.over?g.maalDetails||null:null,pendingSeen:g.pendingSeen||Array(n).fill(false),mustFinish:!!g.mustFinish,dubleeMode:[...g.dubleeMode]});
 if(g.type==='callbreak')Object.assign(view,{bids:[...g.bids],tricks:[...g.tricks],deal:structuredClone(g.deal),trick:structuredClone(g.trick),lastTrick:structuredClone(g.lastTrick||[]),callMatch:g.callMatch?structuredClone(g.callMatch):null,roundOver:!!g.roundOver,dealSequence:g.dealSequence||0,trickSequence:g.trickSequence||0,lastTrickWinner:g.lastTrickWinner??null});
 if(g.type==='daharmara')Object.assign(view,{trump:g.trump,trick:structuredClone(g.trick),lastTrick:structuredClone(g.lastTrick||[]),capturedTens:g.captured.map(h=>h.filter(c=>c.r===10).length),teamWinner:g.over?g.teamWinner:null,kot:!!g.kot});
 if(g.type==='kitti')Object.assign(view,{groups:structuredClone(g.kittiGroups[p]),ready:[...g.ready],allGroups:g.over?structuredClone(g.allGroups):null,showingWinners:g.over?g.showingWinners:null,showdown:g.showdown?structuredClone(g.showdown):null,showdownGroups:publicKittiSets(g)});
 if(g.type==='jutpatti')view.wild=g.wild;
 if(g.type==='faras')Object.assign(view,{seen:[...g.seen],active:[...g.active],bank:[...g.bank],startBank:[...g.startBank],start:g.start,pot:g.pot,stake:g.stake,contributions:[...g.contributions],betSequence:g.betSequence,actionLog:structuredClone(g.actionLog),lastBet:g.lastBet?{...g.lastBet}:null,lastPayout:g.over?structuredClone(g.lastPayout):null});
 return view;
}
function statusMessage(r){const g=r.game,name=p=>r.seats[p].name;
 if(g.over){if(g.type==='faras')return g.winners.map(name).join(' / ')+' won the pot.';if(g.type==='marriage'||g.type==='jutpatti')return name(g.winner)+' finished the deal.';if(g.type==='kitti')return g.winner===null?'Kitti: no winner this deal.':name(g.winner)+' won the deal.';if(g.type==='daharmara')return r.seats.filter((_,p)=>p%2===g.teamWinner).map(s=>s.name).join(' + ')+' won the team deal.';return 'Deal finished. Review the scores.';}
 if(g.type==='kitti'&&g.phase==='showdown')return g.message;
 if(g.type==='daharmara')return name(g.turn)+' · Playing · Trump '+(g.trump||'undecided')+' · Tens '+g.captured.map(h=>h.filter(c=>c.r===10).length).join(' / ');
 return name(g.turn)+' · '+({draw:'Drawing',discard:'Discarding',bid:'Calling',play:'Playing',bet:'Betting',split:'Splitting cards'})[g.phase];
}



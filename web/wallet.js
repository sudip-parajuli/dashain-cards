import {callReserve} from './callbreak-match.js';
import {settleTableChips} from './table-chips.js';
import {POINT_GAMES,economyRules,settleGameEconomy} from './game-economy.js';
export const COINS={initial:5000,entry:10,winReturn:30,refill:200,wait:10*60*1000,daily:150,day:24*60*60*1000};
const round=n=>Math.round(n*1000000)/1000000;
export function newWallet(now=Date.now()){return {balance:COINS.initial,active:null,refillAt:null,dailyAt:now+COINS.day,transactions:[]};}
export function validWallet(w){return w&&Number.isFinite(w.balance)&&w.balance>=0&&w.balance<=1e12&&(w.active===null||typeof w.active==='string')&&(w.refillAt===null||Number.isFinite(w.refillAt))&&Number.isFinite(w.dailyAt)&&Array.isArray(w.transactions)&&w.transactions.length<=30;}
function record(w,label,delta,now){w.transactions=[{label,delta:round(delta),at:now},...w.transactions].slice(0,30);}
export function updateRefill(w,now=Date.now()){if(!w.active&&w.balance<COINS.entry)w.refillAt??=now+COINS.wait;else w.refillAt=null;}
export function coinOutcome(g){if(g.type==='callbreak'&&g.callMatch?.transfers){const delta=g.coinRound?.changes?.[0]??g.callMatch.transfers[0];return delta>0?'win':delta<0?'loss':'tie';}if(g.type==='marriage')return g.winner===0?'win':'loss';if(g.type==='daharmara')return g.teamWinner===0?'win':'loss';const best=g.type==='dhumbal'?Math.min(...g.scores):Math.max(...g.scores);if(g.scores[0]!==best)return 'loss';if(g.type==='kitti'&&best===0)return 'tie';return g.scores.filter(n=>n===best).length>1?'tie':'win';}
export function settleCoins(w,g,now=Date.now(),abandon=false){
 if(!g?.coinRound||g.coinRound.settled||w.active!==g.coinRound.id||(!g.over&&!abandon))return false;
 let refund;if(g.coinRound.version===2&&g.type!=='faras'){const entry=g.coinRound;if(abandon){refund=0;entry.changes=entry.banks.map((_,p)=>p===0?-entry.paid:entry.paid/(entry.banks.length-1));entry.balances=entry.banks.map((b,p)=>b+entry.changes[p]);}else{const result=g.type==='callbreak'&&g.callMatch?settleTableChips(entry.banks,g.callMatch.transfers):settleGameEconomy(g.type,entry.banks,g.scores,entry.rules);entry.changes=result.changes;entry.balances=result.balances;refund=entry.paid+entry.changes[0];}}else refund=g.type==='faras'?g.bank[0]:abandon?0:coinOutcome(g)==='win'?COINS.winReturn:coinOutcome(g)==='tie'?COINS.entry:0;
 g.coinRound.returned=refund;w.balance=round(w.balance+refund);w.active=null;g.coinRound.settled=true;g.coinRound.delta=round(refund-g.coinRound.paid);g.coinRound.outcome=abandon?'left':g.type==='faras'?'chips':coinOutcome(g);record(w,abandon?'Left '+g.type:g.type+' result',refund,now);updateRefill(w,now);return true;
}
export function startCoins(w,g,id,now=Date.now(),previous=null){
 if(w.active)throw Error('Resume or leave the saved coin game first.');const rules=economyRules(g.type,g.type==='callbreak'&&!g.callMatch?{coinsPerPoint:1,...g.options}:g.options||{}),points=POINT_GAMES.includes(g.type)||g.type==='callbreak',paid=g.type==='callbreak'&&g.callMatch?callReserve(g.options,g.hand.length):g.type==='faras'?g.startBank?.[0]??g.start:points?Number(g.options?.coinBudget??Math.min(500,Math.floor(w.balance))):rules.boot;
 if(!Number.isFinite(paid)||paid<1||points&&!Number.isSafeInteger(paid)||w.balance<paid)throw Error('Not enough coins. Open Coins for your free refill.');
 const n=g.hand?.length||g.scores?.length||Number(g.options?.players??3),old=previous?.coinRound?.balances;
 if(g.type==='callbreak'&&g.callMatch&&old?.length===n&&old.slice(1).some(b=>b<paid))throw Error('A bot cannot cover these stakes. Lower the Call Break stakes.');
 const banks=Array.from({length:n},(_,p)=>p===0?(points?paid:w.balance):old?.[p]>=(points?1:rules.boot)?old[p]:COINS.initial);
 w.balance=round(w.balance-paid);w.active=id;w.refillAt=null;g.coinRound={id,version:2,paid,settled:false,rules,banks,...(!points&&g.type!=='faras'?{pot:paid*n}:{})};record(w,g.type+(points?' table budget':' entry'),-paid,now);return g;
}
export function claimCoins(w,kind,now=Date.now()){
 if(kind==='refill'){updateRefill(w,now);if(w.active||w.balance>=COINS.entry||w.refillAt===null||now<w.refillAt)throw Error('Your free refill is not ready yet.');w.balance+=COINS.refill;w.refillAt=null;record(w,'Free refill',COINS.refill,now);}
 else if(kind==='daily'){if(now<w.dailyAt)throw Error('Your daily gift is not ready yet.');w.balance+=COINS.daily;w.dailyAt=now+COINS.day;record(w,'Daily gift',COINS.daily,now);updateRefill(w,now);}
 else throw Error('Unknown coin reward.');
}


// Activity grants one reward after the cooldown; missed days never accumulate.
export function grantDailyActivity(w,now=Date.now()){if(!validWallet(w)||now<w.dailyAt)return false;claimCoins(w,'daily',now);return true;}

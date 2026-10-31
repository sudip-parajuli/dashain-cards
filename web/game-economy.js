import {callRules,rankedCallTransfers} from './callbreak-match.js';
import {settleTableChips} from './table-chips.js';
export const POINT_GAMES=['marriage','dhumbal'];
export function economyRules(type,options={}){
 if(type==='callbreak'&&(options.callMatchVersion===1||options.coinsPerPoint===undefined))return {...callRules(options),economyVersion:2};
 if(type==='faras')return {economyVersion:2};
 if(POINT_GAMES.includes(type)||type==='callbreak'){const rate=Number(options.coinsPerPoint??(type==='marriage'?5:1));if(!Number.isFinite(rate)||rate<.01||rate>1000||Math.abs(rate*100-Math.round(rate*100))>.00001)throw Error('Coins per point must be between 0.01 and 1000, with at most two decimals.');return {economyVersion:2,coinsPerPoint:rate};}
 if(!['jutpatti','kitti','daharmara'].includes(type))throw Error('Choose a supported game.');const boot=Number(options.boot??options.winPoints??10);if(!Number.isSafeInteger(boot)||boot<1||boot>1000)throw Error('Boot must be a whole number from 1 to 1000.');return {economyVersion:2,boot};
}
export function gameTransfers(type,scores,options={}){
 const rules=economyRules(type,options),n=scores.length;if(n<2||scores.some(n=>!Number.isFinite(n)))throw Error('Invalid round scores.');
 if(type==='callbreak'&&rules.callMatchVersion===1)return rankedCallTransfers(scores,rules).transfers;
 if(POINT_GAMES.includes(type)||type==='callbreak'){const total=scores.reduce((a,b)=>a+b,0),base=type==='marriage'?scores:scores.map(n=>(n*scores.length-total)*(type==='dhumbal'?-1:1));if(Math.abs(base.reduce((a,b)=>a+b,0))>.001)throw Error('Point transfers must balance.');return base.map(n=>Math.round(n*rules.coinsPerPoint*1000000)/1000000||0);}
 const best=Math.max(...scores),salami=scores.some(v=>v===2),winners=scores.map((v,p)=>v>0?p:-1).filter(p=>p>=0);return scores.map((_,p)=>winners.includes(p)?rules.boot*(n-winners.length)*(salami?2:1)/winners.length:-rules.boot*(salami?2:1));
}
export function settleGameEconomy(type,balances,scores,options={}){return settleTableChips(balances,gameTransfers(type,scores,options));}


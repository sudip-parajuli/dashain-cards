import {marriageScore,integer} from './core.js';
// Carryovers are liabilities, not a cash pot. Charge and credit together only
// when a later round has a winner, keeping the saved scoreboard balanced.
export function marriageLedger(rounds,rules={}){
 let pending=[];const calculated=[];
 for(let index=0;index<rounds.length;index++){
  const round=rounds[index],d=round.data;if(!d){calculated.push({...round});continue;}
  const fouls=d.fouls||[];if(!Array.isArray(fouls)||fouls.length>d.rows.length)throw Error('Choose valid foul players.');
  const used=new Set();for(const f of fouls){integer(f.player,0,d.rows.length-1);if(used.has(f.player)||!['dealing','play'].includes(f.type))throw Error('Choose one foul type per player.');used.add(f.player);}
  if(d.cancelled&&d.winner!==null)throw Error('A cancelled deal cannot have a winner.');
  const rows=d.rows.map((p,i)=>({...p,skipWinningFee:!!rules.foulReplacesFee&&used.has(i)}));
  const scores=d.cancelled?rows.map(()=>0):marriageScore(rows,d.winner,rules,d.dublee,!!(d.double&&rules.doubleEnabled));
  const paid=[];
  if(d.winner!==null){for(const f of pending){scores[f.player]-=f.points;scores[d.winner]+=f.points;paid.push({...f,winner:d.winner});}pending=[];}
  const doubled=rules.doubleEnabled&&(d.double||d.dublee||rows.some(p=>p.status==='dublee'));
  for(const f of fouls){const amount=integer(Number(rules[f.type==='dealing'?'dealerFoulPoints':'playFoulPoints']??15),0,100000)*(doubled?2:1);if(amount)pending.push({...f,points:amount,round:index+1});}
  calculated.push({...round,scores,foulPayments:paid});
 }
 return {rounds:calculated,pending};
}

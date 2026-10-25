import {marriageCalculation,integer} from './core.js';
import {marriageLedger} from './marriage-ledger.js';
export function explainMarriageRound(session,index){
 integer(index,0,session.rounds.length-1);const raw=session.rounds[index],rate=Number(session.rules.pointRate??1);
 if(!raw.data?.rows)return {available:false,rate,scores:[...raw.scores],round:index+1};
 const d=raw.data,rules=session.rules,ledger=marriageLedger(session.rounds.slice(0,index+1),rules),round=ledger.rounds.at(-1),fouls=d.fouls||[],rows=d.rows.map((p,i)=>({...p,skipWinningFee:!!rules.foulReplacesFee&&fouls.some(f=>f.player===i)}));
 const calc=d.cancelled?{scores:rows.map(()=>0),players:rows.map((p,i)=>({player:i,status:p.status,enteredMaal:p.maal,countedMaal:0,base:0,fee:0,feeBase:0,feeBonus:0,feeReason:'cancelled',received:0})),totalMaal:0,activeCount:rows.filter(p=>p.status!=='out').length,factor:1,winner:null,unseenMaal:rules.unseenMaal??'count',unseenMaalRemoved:0,unseenMaalTransferred:0}:marriageCalculation(rows,d.winner,rules,d.dublee,!!(d.double&&rules.doubleEnabled));
 const payments=round.foulPayments||[];calc.players=calc.players.map(p=>{const foulPaid=payments.filter(f=>f.player===p.player).reduce((a,f)=>a+f.points,0),foulReceived=payments.filter(f=>f.winner===p.player).reduce((a,f)=>a+f.points,0);return {...p,foulPaid,foulReceived,score:round.scores[p.player],amount:Math.round(round.scores[p.player]*rate*100)/100};});
 return {...calc,available:true,round:index+1,rate,cancelled:!!d.cancelled,scores:round.scores,payments,newFouls:ledger.pending.filter(f=>f.round===index+1),matchesSaved:round.scores.every((v,i)=>v===raw.scores[i])};
}

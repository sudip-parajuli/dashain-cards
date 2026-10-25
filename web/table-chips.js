// Friends use table chips, separate from the device's bot coin wallet.
// Cap each debt at that seat's balance and share collected chips among winners.
export function settleTableChips(balances,scores){
 if(balances.length!==scores.length||balances.some(n=>!Number.isFinite(n)||n<0)||scores.some(n=>!Number.isFinite(n))||Math.abs(scores.reduce((a,b)=>a+b,0))>0.001)throw Error('Invalid table chip settlement.');
 const delta=scores.map((n,p)=>n<0?-Math.min(Math.round(balances[p]*100),Math.round(-n*100)):0),pot=-delta.reduce((a,b)=>a+b,0),wins=scores.map((n,p)=>({p,weight:Math.max(0,n)})).filter(x=>x.weight),total=wins.reduce((a,x)=>a+x.weight,0);
 let paid=0;for(const x of wins){x.share=Math.floor(pot*x.weight/total);x.fraction=pot*x.weight/total-x.share;paid+=x.share;delta[x.p]=x.share;}
 wins.sort((a,b)=>b.fraction-a.fraction||a.p-b.p);for(let i=0;i<pot-paid;i++)delta[wins[i%wins.length].p]++;
 return {changes:delta.map(n=>n/100),balances:balances.map((n,p)=>Math.round((n*100+delta[p]))/100)};
}

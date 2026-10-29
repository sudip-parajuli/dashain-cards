import {threeRank,compare,playerName} from './core.js';
export function beginKittiShowdown(g,all){
 const n=g.hand.length;if(all.length!==n||all.some((sets,p)=>sets.length!==3||sets.some(h=>h.length!==3)||new Set(sets.flat().map(c=>c.id)).size!==9||sets.flat().some(c=>!g.hand[p].some(x=>x.id===c.id))))throw Error('Complete three valid hands for every player.');
 g.allGroups=all;const direction=g.options.revealDirection==='anticlockwise'?-1:1,start=((g.dealer??n-1)+direction+n)%n;
 g.showdown={round:0,lead:start,firstLeader:null,order:Array.from({length:n},(_,i)=>(start+i*direction+n*2)%n),revealed:[],roundWinners:[],awaitingNext:false,direction};
 g.phase='showdown';g.turn=start;g.selected=[];g.message='Showdown · Highest hands first. Reveal order starts with '+playerName(g,start)+'.';
}
export function revealKittiSet(g,p,finish){
 if(g.over||g.phase!=='showdown'||g.turn!==p||!g.showdown)throw Error('Wait for your reveal turn.');
 const s=g.showdown,n=g.hand.length;
 if(s.awaitingNext){s.round++;s.lead=s.firstLeader;s.order=Array.from({length:n},(_,i)=>(s.lead+i*s.direction+n*2)%n);s.revealed=[];s.awaitingNext=false;}
 s.revealed.push(p);
 if(s.revealed.length<n){g.turn=s.order[s.revealed.length];g.message='Showing '+(s.round+1)+' · '+playerName(g,g.turn)+' reveals next.';return;}
 let winners=[s.order[0]];for(const q of s.order.slice(1)){const c=compare(threeRank(g.allGroups[q][s.round],g.options.aceLowBest),threeRank(g.allGroups[winners[0]][s.round],g.options.aceLowBest));if(c>0)winners=[q];else if(c===0)winners.push(q);}
 s.roundWinners.push(winners);if(s.round===0)s.firstLeader=winners[0];
 g.message=winners.map(q=>playerName(g,q)).join(' / ')+' won showing '+(s.round+1)+'.';
 if(s.round===2){finish(g,g.allGroups);return;}
 s.awaitingNext=true;g.turn=s.firstLeader;
}
export function publicKittiSets(g){const s=g.showdown;return s?g.allGroups.map((sets,p)=>sets.map((h,r)=>r<s.round||r===s.round&&s.revealed.includes(p)?h.map(c=>({...c})):null)):null;}

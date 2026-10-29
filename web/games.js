import {beginKittiShowdown,revealKittiSet} from './kitti-showdown.js';
import {playerName} from './core.js';
import {deck,shuffle,legalCards,trickWinner,callScore,callDealConfig,threeRank,compare,isJut,dhumbalScore} from './core.js';
import {newMarriage} from './marriage.js';
import {newDahar} from './dahar.js';
import {newFaras} from './faras.js';
export function jutpattiWild(indicator,players,mode='auto'){if(mode==='below')mode='auto';if(mode==='none')return 0;if(mode==='same'||mode==='auto'&&players<4)return indicator;return indicator===14?2:indicator+1;}
export function newGame(type,options={}){
 if(type==='marriage')return newMarriage(options);
 if(type==='daharmara')return newDahar(options);
 if(type==='faras')return newFaras(options);
 const g={type,options,hand:[],stock:shuffle(deck(type==='marriage'?3:1)),pile:[],turn:0,phase:'draw',message:'Your turn',over:false,scores:[0,0,0],selected:[],taken:null,steps:0};
 if(type==='callbreak'){const deal=callDealConfig(Number(options.players??4));g.deal=deal;g.removed=deal.removed;const ids=new Set(g.removed.map(c=>c.id));g.stock=g.stock.filter(c=>!ids.has(c.id));g.hand=Array.from({length:deal.players},()=>g.stock.splice(0,deal.cardsPerPlayer));g.bids=Array(deal.players).fill(0);g.tricks=Array(deal.players).fill(0);g.trick=[];g.phase='bid';g.scores=Array(deal.players).fill(0);g.message='How many tricks will you take?';}
 else if(type==='kitti'){g.hand=Array.from({length:Number(options.players??3)},()=>g.stock.splice(0,9));g.groups=[];g.phase='split';g.message='Select three cards for your first hand.';}
 else if(type==='faras'){g.hand=Array.from({length:3},()=>g.stock.splice(0,3));g.phase='show';g.message='Hand comparison practice. Reveal to compare all three hands.';}
 else if(type==='jutpatti'){g.hand=Array.from({length:Number(options.players??3)},()=>g.stock.splice(0,Number(options.cards)||5));g.tip=g.stock.pop();g.wild=jutpattiWild(g.tip.r,g.hand.length,options.wild??'auto');g.message='Draw a card. Declare Jut when every card is paired.';}
 else if(type==='dhumbal'){g.hand=Array.from({length:Number(options.players??3)},()=>g.stock.splice(0,5));g.pile.push(g.stock.pop());g.message='Draw, then discard one card or a matching set. Call before drawing.';}
 g.scores=g.hand.map(()=>0);return g;
}
export function cardValue(c,o={}){return c.r===14?1:c.r===11&&o.jackZero?0:c.r>10?(o.faceValues==='rank'?c.r:10):c.r;}
export function handTotal(cards,o){return cards.reduce((n,c)=>n+cardValue(c,o),0);}
function draw(g,p,source){
 if(source==='pile'&&!g.pile.length)throw Error('The discard pile is empty.');
 if(source==='stock'&&!g.stock.length){if(g.pile.length>1){const top=g.pile.pop();g.stock=shuffle(g.pile);g.pile=[top];}else throw Error('No cards left to draw.');}
 const c=(source==='pile'?g.pile:g.stock).pop();g.hand[p].push(c);g.taken=source==='pile'?c.id:null;return c;
}
export function drawHuman(g,source,p=0){if(g.over||g.turn!==p||g.phase!=='draw')throw Error('Wait until your draw turn.');const drawn=draw(g,p,source);g.phase='discard';g.message=g.type==='jutpatti'?'Declare Jut or select one card to discard.':'Select one card or a matching set to discard.';return drawn;}
export function discardHuman(g,ids,p=0){if(g.over||g.turn!==p||g.phase!=='discard')throw Error('Draw before discarding.');const cards=g.hand[p].filter(c=>ids.includes(c.id));if(!cards.length||cards.length!==ids.length)throw Error('Select cards from your hand.');if(cards.some(c=>c.id===g.taken))throw Error('You must keep the card you took from the discard pile this turn.');if(g.type==='jutpatti'&&cards.length!==1)throw Error('Discard exactly one card.');if(g.type==='dhumbal'&&!validThrow(cards,g.options))throw Error('Discard a single card, a same-rank set, or an enabled suited run.');discard(g,p,cards);g.phase='draw';g.turn=(p+1)%g.hand.length;g.selected=[];g.message='Opponents are playing…';}
function validThrow(cards,o){if(cards.length===1||cards.every(c=>c.r===cards[0].r))return true;if(!o.runs||cards.length<3)return false;const r=cards.map(c=>c.r===14?1:c.r).sort((a,b)=>a-b);return cards.every(c=>c.s===cards[0].s)&&r.every((n,i)=>!i||n===r[i-1]+1);}
function discard(g,p,cards){const ids=cards.map(c=>c.id);g.hand[p]=g.hand[p].filter(c=>!ids.includes(c.id));g.pile.push(...cards);g.taken=null;g.steps++;}
export function declareHuman(g,p=0){if(g.over||g.turn!==p)throw Error('Wait for your turn.');if(g.type==='jutpatti'){if(g.phase!=='discard'||!isJut(g.hand[p],g.wild))throw Error('Draw first and complete all pairs.');g.over=true;g.winner=p;g.scores=g.hand.map((_,i)=>i===p?1:0);g.message='Jut! You won this round.';}else{if(g.phase!=='draw')throw Error('Call before drawing.');finishDhumbal(g,p);}}
function finishDhumbal(g,p){g.caller=p;const totals=g.hand.map(h=>handTotal(h,g.options));g.scores=dhumbalScore(totals,p,Number(g.options.limit??5),Number(g.options.penalty??25));g.over=true;const success=g.scores[p]===0;g.message=`${playerName(g,p)} called ${totals[p]}. ${success?'Successful Jhyap!':'Caught: caller receives the configured penalty.'} Lowest cumulative score wins.`;}
export function botDrawTurn(g){if(g.over||g.turn===0)return;const p=g.turn;
 if(g.type==='dhumbal'&&handTotal(g.hand[p],g.options)<=Number(g.options.limit??5)){finishDhumbal(g,p);return;}
 let source='stock';const top=g.pile.at(-1);
 if(top){if(g.type==='jutpatti'&&(top.r===g.wild||g.hand[p].some(c=>c.r===top.r)))source='pile';if(g.type==='dhumbal'&&cardValue(top,g.options)<=2)source='pile';}
 draw(g,p,source);
 if(g.type==='jutpatti'&&isJut(g.hand[p],g.wild)){g.over=true;g.winner=p;g.scores=g.hand.map((_,i)=>i===p?1:0);g.message=`${playerName(g,p)} declared Jut.`;return;}
 const allowed=g.hand[p].filter(c=>c.id!==g.taken);let drop;
 if(g.type==='dhumbal'){const sets=allowed.map(c=>allowed.filter(x=>x.r===c.r));sets.sort((a,b)=>handTotal(b,g.options)-handTotal(a,g.options));drop=sets[0];}
 else {const counts={};g.hand[p].forEach(c=>counts[c.r]=(counts[c.r]||0)+1);drop=[allowed.sort((a,b)=>((a.r===g.wild?100:counts[a.r]%2===0?20:0)-(b.r===g.wild?100:counts[b.r]%2===0?20:0))||b.r-a.r)[0]];}
 discard(g,p,drop);g.turn=(p+1)%g.hand.length;g.phase='draw';g.message=g.turn===0?'Your turn: draw or declare.':`${playerName(g,g.turn)} is playing…`;
}
export function bidHuman(g,bid){if(g.phase!=='bid')throw Error('Bidding has finished.');const max=g.deal?.totalTricks??13;if(!Number.isInteger(bid)||bid<1||bid>max)throw Error(`Call between 1 and ${max}.`);g.bids[0]=bid;for(let p=1;p<g.hand.length;p++)g.bids[p]=Math.max(1,Math.min(max,g.hand[p].filter(c=>c.r>=12||(c.s==='S'&&c.r>=8)).length));g.phase='play';g.message='Spades are trump. Play a legal card.';}
export function playTrickCard(g,p,id){if(g.over||g.phase!=='play'||g.turn!==p)throw Error('Wait for your turn.');const legal=legalCards(g.hand[p],g.trick);const c=legal.find(c=>c.id===id);if(!c)throw Error('Follow suit and beat the winning card when possible; otherwise trump if available.');g.hand[p]=g.hand[p].filter(c=>c.id!==id);g.trick.push({player:p,card:c});if(g.trick.length===g.hand.length){g.lastTrick=[...g.trick];const win=trickWinner(g.trick);g.tricks[win]++;g.turn=win;g.trick=[];g.message=`${playerName(g,win)} took the trick.`;if(g.hand.every(h=>!h.length)){g.over=true;g.scores=g.bids.map((b,i)=>g.options.overtricks===false?(g.tricks[i]<b?-b:b):callScore(b,g.tricks[i],g.deal?.totalTricks??13));g.message='Deal finished. Scores include your calls and tricks.';}}else g.turn=(p+1)%g.hand.length;}
export function botTrickTurn(g){const p=g.turn,legal=legalCards(g.hand[p],g.trick);const sorted=[...legal].sort((a,b)=>a.r-b.r);playTrickCard(g,p,sorted[0].id);}
function bestSplit(cards,lowBest){let best=null,bestValue=-Infinity;
 function combos(a){const out=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)out.push([a[i],a[j],a[k]]);return out;}
 for(const a of combos(cards)){const rem=cards.filter(c=>!a.includes(c));for(const b of combos(rem)){const c=rem.filter(x=>!b.includes(x));const groups=[a,b,c].sort((x,y)=>compare(threeRank(y,lowBest),threeRank(x,lowBest)));const weights=[1,2,1];const value=groups.reduce((sum,h,i)=>{const r=threeRank(h,lowBest);return sum+weights[i]*(r[0]*20+r[1]);},0);if(value>bestValue){best=groups;bestValue=value;}}}return best;
}
export function addKittiGroup(g,ids){if(g.phase!=='split'||g.over)throw Error('This deal is finished.');if(ids.length!==3)throw Error('Select exactly three cards.');const used=g.groups.flat().map(c=>c.id);const cards=g.hand[0].filter(c=>ids.includes(c.id)&&!used.includes(c.id));if(cards.length!==3)throw Error('Choose three unused cards.');g.groups.push(cards);g.selected=[];if(g.groups.length<3){g.message=`Select three cards for hand ${g.groups.length+1}.`;return;}
 const low=g.options.aceLowBest||false;const all=[g.groups.sort((a,b)=>compare(threeRank(b,low),threeRank(a,low))),...g.hand.slice(1).map(h=>bestSplit(h,low))];return beginKittiShowdown(g,all);
}
export function resolveKitti(g,all){const low=g.options.aceLowBest||false;g.allGroups=all;
 const four=g.hand.map(h=>Math.max(...h.map(c=>h.filter(x=>x.r===c.r).length))>=4?h.find(c=>h.filter(x=>x.r===c.r).length===4).r:0);
 let winner=null;const wins=[];if(four.some(Boolean)){const max=Math.max(...four);winner=four.indexOf(max);g.message=`${playerName(g,winner)} wins with four of a kind.`;}
 else {for(let r=0;r<3;r++){let best=[0],v=threeRank(all[0][r],low);for(let p=1;p<g.hand.length;p++){const cmp=compare(threeRank(all[p][r],low),v);if(cmp>0){best=[p];v=threeRank(all[p][r],low);}else if(!cmp)best.push(p);}wins.push(best.length===1?best[0]:null);}if(g.options.anyTwo){winner=g.hand.map((_,p)=>p).find(p=>wins.filter(w=>w===p).length>=2)??null;}else if(wins[1]!==null&&(wins[0]===wins[1]||wins[2]===wins[1]))winner=wins[1];g.message=winner===null?'Kitti: no winner this deal.':`${playerName(g,winner)} wins${wins.every(w=>w===winner)?' with a Salami!':'.'}`;}
 g.winner=winner;g.showingWinners=wins;g.scores=g.hand.map(()=>0);if(winner!==null)g.scores[winner]=1;g.over=true;g.phase='result';
}
export function revealFaras(g){const ranks=g.hand.map(h=>threeRank(h,g.options.aceLowBest??true));let best=[0];for(let p=1;p<3;p++){const c=compare(ranks[p],ranks[best[0]]);if(c>0)best=[p];else if(!c)best.push(p);}g.scores=g.hand.map((_,p)=>best.includes(p)?1/best.length:0);g.over=true;g.message=best.length>1?'Tied best hands share one practice point.':`${playerName(g,best[0])} has the strongest hand.`;}

export function advanceKitti(g,p=g.turn){return revealKittiSet(g,p,resolveKitti);}

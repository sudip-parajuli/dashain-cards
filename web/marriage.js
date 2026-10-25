import {playerName} from './core.js';
import {nepaliMaal} from './nepali-maal.js';
import {deck,shuffle,marriageScore,DEFAULT_MARRIAGE,integer} from './core.js';
const combinations=a=>{const out=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)out.push([a[i],a[j],a[k]]);return out;};
export const wildMarriage=(c,tip)=>c.r>=15||!!tip&&(c.r===tip.r||(c.s===tip.s&&(c.r===(tip.r===14?2:tip.r+1)||c.r===(tip.r===2?14:tip.r-1))));
export function pureMeld(a,options={}){if(a.length===3&&options.supermanInOpening&&a.some(c=>c.r===17)){const normal=a.filter(c=>c.r!==17);if(!normal.length||normal.some(c=>c.r>=15)||!normal.every(c=>c.s===normal[0].s)||new Set(normal.map(c=>c.r)).size!==normal.length)return false;return [...Array.from({length:11},(_,i)=>[i+2,i+3,i+4]),[14,2,3]].some(run=>normal.every(c=>run.includes(c.r)));}if(a.length!==3||a.some(c=>c.r>=15))return false;if(a.every(c=>c.r===a[0].r&&c.s===a[0].s))return true;const r=a.map(c=>c.r).sort((a,b)=>a-b);return a.every(c=>c.s===a[0].s)&&new Set(r).size===3&&((r[1]===r[0]+1&&r[2]===r[1]+1)||r.join()==='2,3,14');}
export function meld(a,tip){if(pureMeld(a))return true;const normal=a.filter(c=>!wildMarriage(c,tip));if(normal.length<=1)return true;if(normal.every(c=>c.r===normal[0].r)&&new Set(normal.map(c=>c.s)).size===normal.length)return true;if(!normal.every(c=>c.s===normal[0].s)||new Set(normal.map(c=>c.r)).size!==normal.length)return false;const ranks=normal.map(c=>c.r);const runs=[...Array.from({length:11},(_,i)=>[i+2,i+3,i+4]),[14,2,3]];return runs.some(run=>ranks.every(r=>run.includes(r)));}
export function findMelds(cards,count,pure,tip,options={}){const triples=combinations(cards).filter(a=>pure?pureMeld(a,options):meld(a,tip));function search(start,groups,used){if(groups.length===count)return groups;for(let i=start;i<triples.length;i++){if(triples[i].some(c=>used.has(c.id)))continue;const next=new Set(used);triples[i].forEach(c=>next.add(c.id));const found=search(i+1,[...groups,triples[i]],next);if(found)return found;}return null;}return search(0,[],new Set());}
export function exactPairs(cards){const map={};cards.forEach(c=>{const k=c.s+c.r;(map[k]??=[]).push(c);});return Object.values(map).flatMap(a=>a.length>=2?[a.slice(0,2)]:[]);}
export function maalCount(cards,tip,options={},tunnelas=[],openingGroups=[]){
 if(options.scoringProfile==='nepal'||options.scoringProfile==='bhoos'||options.pointRules)return nepaliMaal(cards,tip,tunnelas,openingGroups,options).total;
 const unique=[...new Map(cards.map(c=>[c.id,c])).values()];let bonus=0;const excluded=new Set();
 const scale=(options.tunnelaScale??'rank')==='rank';
 for(const group of tunnelas){const c=group[0];const sameColour=tip&&c.s!==tip.s&&(['H','D'].includes(c.s)===['H','D'].includes(tip.s));
  const amount=c.r===15?45:scale&&tip&&c.r===tip.r?10:scale&&tip&&c.s===tip.s&&(c.r===(tip.r===14?2:tip.r+1)||c.r===(tip.r===2?14:tip.r-1))?20:Number(options.tunnelaPoints??5);
  bonus+=amount;if(scale||c.r===15)group.forEach(c=>excluded.add(c.id));
 }
 const held=unique.filter(c=>!excluded.has(c.id));bonus+=held.filter(c=>c.r===15).length*5+held.filter(c=>c.r===16).length*10;
 if(!tip)return bonus;
 const up=tip.r===14?2:tip.r+1,down=tip.r===2?14:tip.r-1;let t=held.filter(c=>c.s===tip.s&&c.r===tip.r).length,p=held.filter(c=>c.s===tip.s&&c.r===up).length,j=held.filter(c=>c.s===tip.s&&c.r===down).length;
 const marriages=Math.min(t,p,j);t-=marriages;p-=marriages;j-=marriages;
 if(options.alter){const other={H:'D',D:'H',S:'C',C:'S'}[tip.s];bonus+=held.filter(c=>c.r===tip.r&&c.s===other).length*Number(options.alterPoints??5);}
 return bonus+([0,10,30,90][marriages]??0)+([0,3,7,10][t]??0)+([0,2,5,10][p]??0)+([0,2,5,10][j]??0);
}
export function canDubleeTake(g,p,top){return !g.pendingSeen?.[p]&&!!top&&g.hand[p].some(c=>c.r===top.r&&c.s===top.s);}
export function playerMaal(g,p){return maalCount([...g.hand[p],...g.exposed[p]],g.tip,g.options,g.seen[p]?g.tunnelas?.[p]||[]:[],g.openingGroups?.[p]||[]);}
// Migrate saved deals where public tunnela cards were also left in the hand.
export function normalizeExposures(g){g.exposed??=g.hand.map(()=>[]);g.tunnelas??=g.hand.map(()=>[]);g.hand.forEach((h,p)=>{g.exposed[p]=[...new Map([...g.exposed[p],...g.tunnelas[p].flat()].map(c=>[c.id,c])).values()];const ids=new Set(g.exposed[p].map(c=>c.id));g.hand[p]=h.filter(c=>!ids.has(c.id));});return g;}
const closingCount=(g,p)=>Math.max(0,(21-g.exposed[p].length)/3);
function botOpening(g,p){const ground=(g.tunnelas?.[p]||[]).filter(h=>pureMeld(h,g.options)).slice(0,3);const rest=findMelds(g.hand[p],3-ground.length,true,g.tip,g.options);return rest?[...ground,...rest]:null;}
export function exposeTunnelas(g,p,initial=false){
 g.tunnelas??=g.hand.map(()=>[]);const existing=new Set(g.tunnelas[p].flat().map(c=>c.id));const buckets=new Map();
 for(const c of g.hand[p]){const key=c.s+c.r;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(c);}
 if(initial||g.options.tunnelaTiming==='any')for(const cards of buckets.values())if(cards.length===3&&!(g.options.scoringProfile==='nepal'&&cards[0].r>=15)&&!cards.some(c=>existing.has(c.id)))g.tunnelas[p].push(cards.map(c=>({...c})));
 normalizeExposures(g);
}
export function newMarriage(options={}){const count=integer(Number(options.players??4),2,7),stock=shuffle([...deck(3),...(options.printedJokers?Array.from({length:3},(_,i)=>({id:i+'J15',r:15,s:'J'})):[]),...((options.masterEnabled??options.printedJokers)?[{id:'0M16',r:16,s:'M'}]:[]),...(options.supermanEnabled?[{id:'0U17',r:17,s:'U'}]:[])]),hand=Array.from({length:count},()=>stock.splice(0,21));const tipIndex=stock.findIndex(c=>c.r<=14),tip=stock.splice(tipIndex,1)[0];const g={type:'marriage',options,stock,hand,pile:[stock.pop()],tip,seen:Array(count).fill(false),exposed:Array.from({length:count},()=>[]),dubleeMode:Array(count).fill(false),turn:0,phase:'draw',selected:[],taken:null,over:false,scores:Array(count).fill(0),steps:0,message:'Build three pure melds or seven exact pairs to see the maal.'};g.hand.forEach((_,p)=>exposeTunnelas(g,p,true));return g;}
export function showMarriage(g,p,ids){normalizeExposures(g);if(g.over||g.turn!==p||(g.seen[p]||g.pendingSeen?.[p]))throw Error('You can show once, on your turn.');const cards=g.hand[p].filter(c=>ids.includes(c.id)),ground=(g.tunnelas[p]||[]).filter(h=>pureMeld(h,g.options)).slice(0,3);let groups;
 if(cards.length===9-ground.length*3){const remaining=findMelds(cards,3-ground.length,true,g.tip,g.options);if(!remaining)throw Error('Select cards forming three pure melds together with your exposed tunnelas.');groups=[...ground,...remaining];}
 else if(cards.length===14&&!g.exposed[p].length){groups=exactPairs(cards);if(groups.length!==7)throw Error('Select seven exact pairs: identical rank and suit.');g.dubleeMode[p]=true;}
 else throw Error(`Select ${9-ground.length*3} cards to complete your opening. Dublees require fourteen cards and no exposed tunnela.`);
 g.openingGroups??=g.hand.map(()=>[]);g.openingGroups[p]=groups.map(h=>h.map(c=>({...c})));g.exposed[p]=[...new Map([...g.exposed[p],...groups.flat()].map(c=>[c.id,c])).values()];normalizeExposures(g);g.pendingSeen??=g.hand.map(()=>false);g.pendingSeen[p]=g.options.maalTiming==='discard';g.seen[p]=!g.pendingSeen[p];g.selected=[];g.message=g.pendingSeen[p]?'Opening shown. Discard before viewing the maal.':'Maal seen. Complete your remaining melds, or the eighth dublee.';}
export function marriageDraw(g,p,source){normalizeExposures(g);if(g.over||g.turn!==p||g.phase!=='draw')throw Error('Draw only at the beginning of your turn.');if(source==='pile'){const top=g.pile.at(-1);if(!top)throw Error('Discard pile is empty.');if(g.seen[p]&&wildMarriage(top,g.tip))throw Error('A player who has seen the maal cannot take a discarded wild card.');if(g.dubleeMode[p]){if(!canDubleeTake(g,p,top))throw Error('A dublee player may take the discard only to complete the eighth pair.');}}
 if(!g.stock.length){const top=g.pile.pop();g.stock=shuffle(g.pile);g.pile=[top];if(!g.stock.length)throw Error('No cards available to recycle.');}const c=(source==='pile'?g.pile:g.stock).pop();g.hand[p].push(c);exposeTunnelas(g,p);g.taken=source==='pile'?c.id:null;g.mustFinish=g.dubleeMode[p]&&source==='pile';g.phase='discard';g.message='Show your pure melds, finish if ready, or discard one card.';return c;
}
export function marriageDiscard(g,p,ids){if(g.over||g.turn!==p||g.phase!=='discard')throw Error('Draw before discarding.');if(g.mustFinish)throw Error('Taking the eighth dublee must finish the deal.');if(ids.length!==1)throw Error('Discard exactly one card.');const c=g.hand[p].find(c=>c.id===ids[0]);if(!c){if(g.exposed[p].some(x=>x.id===ids[0]))throw Error('Exposed tunnelas stay on the table.');throw Error('Choose a card in your hand.');}if(g.tunnelas?.[p]?.flat().some(x=>x.id===c.id))throw Error('Exposed tunnelas stay on the table.');if(c.id===g.taken)throw Error('Keep the card taken from the pile for this turn.');g.hand[p]=g.hand[p].filter(x=>x.id!==c.id);g.pile.push(c);g.recentDiscards=[...(g.recentDiscards||[]),{player:p,card:{...c}}].slice(-g.hand.length);g.taken=null;g.selected=[];if(g.pendingSeen?.[p]){g.pendingSeen[p]=false;g.seen[p]=true;}g.phase='draw';g.turn=(p+1)%g.hand.length;g.steps++;g.message=g.turn===0?'Your turn. Draw or show your opening.':`${playerName(g,g.turn)} is playing…`;}
export function finishMarriage(g,p){normalizeExposures(g);
 if(g.over||g.turn!==p||g.phase!=='discard'||!g.seen[p])throw Error('See the maal and draw before finishing.');
 const protectedIds=new Set(g.tunnelas?.[p]?.flat().map(c=>c.id)||[]);
 const discard=g.hand[p].find(c=>c.id!==g.taken&&!protectedIds.has(c.id)&&(g.dubleeMode[p]?exactPairs(g.hand[p].filter(x=>x.id!==c.id)).length>=1:g.hand[p].length-1===closingCount(g,p)*3&&!!findMelds(g.hand[p].filter(x=>x.id!==c.id),closingCount(g,p),false,g.tip)));
 if(!discard)throw Error(g.dubleeMode[p]?'You need an eighth exact pair and a legal final discard.':'The remaining cards must complete seven melds across your hand and the ground, with one legal discard.');
 g.hand[p]=g.hand[p].filter(c=>c.id!==discard.id);g.pile.push(discard);g.recentDiscards=[...(g.recentDiscards||[]),{player:p,card:{...discard}}].slice(-g.hand.length);
 const rows=g.hand.map((h,i)=>({status:g.seen[i]?(g.dubleeMode[i]?'dublee':'seen'):'unseen',maal:playerMaal(g,i)}));
 g.scores=marriageScore(rows,p,{...DEFAULT_MARRIAGE,...g.options},g.dubleeMode[p]);g.maalDetails=g.hand.map((h,i)=>(g.options.scoringProfile==='nepal'||g.options.scoringProfile==='bhoos'||g.options.pointRules)?nepaliMaal([...h,...g.exposed[i]],g.tip,g.seen[i]?g.tunnelas?.[i]||[]:[],g.openingGroups?.[i]||[],g.options):{total:playerMaal(g,i),items:[]});g.over=true;g.winner=p;g.mustFinish=false;g.message=`${playerName(g,p)} finished${g.dubleeMode[p]?' on dublees':''}. Maal and house rules determine the scores.`;
}
function value(c,h,tip,seen){if(seen&&wildMarriage(c,tip))return 100;const same=h.filter(x=>x.id!==c.id&&x.r===c.r);const exact=same.filter(x=>x.s===c.s);const near=h.filter(x=>x.id!==c.id&&x.s===c.s&&Math.abs(x.r-c.r)<=2);return exact.length*8+same.length*3+near.length*4;}
export function marriageBot(g){normalizeExposures(g);const p=g.turn;if(!g.seen[p]&&!g.pendingSeen?.[p]){const pure=botOpening(g,p);const pairs=exactPairs(g.hand[p]);if(pure)showMarriage(g,p,pure.flat().map(c=>c.id));else if(!g.exposed[p].length&&pairs.length>=7)showMarriage(g,p,pairs.slice(0,7).flat().map(c=>c.id));}
 const top=g.pile.at(-1);let source='stock';if(top&&(!g.seen[p]||!wildMarriage(top,g.tip))&&(!g.dubleeMode[p]||canDubleeTake(g,p,top))&&value(top,g.hand[p],g.tip,g.seen[p])>=8)source='pile';marriageDraw(g,p,source);
 if(!g.seen[p]&&!g.pendingSeen?.[p]){const pure=botOpening(g,p);const pairs=exactPairs(g.hand[p]);if(pure)showMarriage(g,p,pure.flat().map(c=>c.id));else if(!g.exposed[p].length&&pairs.length>=7)showMarriage(g,p,pairs.slice(0,7).flat().map(c=>c.id));}
 if(g.seen[p]){const ready=g.dubleeMode[p]?exactPairs(g.hand[p]).length:findMelds(g.hand[p],closingCount(g,p),false,g.tip);if(ready){try{finishMarriage(g,p);return;}catch(e){if(g.mustFinish)throw e;}} }
 const discard=g.hand[p].filter(c=>c.id!==g.taken&&!g.tunnelas?.[p]?.flat().some(x=>x.id===c.id)).sort((a,b)=>value(a,g.hand[p],g.tip,g.seen[p])-value(b,g.hand[p],g.tip,g.seen[p]))[0];marriageDiscard(g,p,[discard.id]);
}

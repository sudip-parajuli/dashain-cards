import {threeRank,isJut} from './core.js';
import {pureMeld,meld,wildMarriage} from './marriage.js';
const suitRank=(a,b)=>a.s.localeCompare(b.s)||a.r-b.r||String(a.id).localeCompare(String(b.id));
const descending=(a,b)=>b.r-a.r||suitRank(a,b);
const modes=new Map();
export const sortMode=(g,p=0)=>g.dubleeMode?.[p]?'dublee':(g.seen?.[p]||g.pendingSeen?.[p]||g.exposed?.[p]?.length)?'auto':modes.get(g.type+':'+p)||'auto';
export function toggleSortMode(g,p=0){modes.set(g.type+':'+p,sortMode(g,p)==='dublee'?'auto':'dublee');}
function pairGroups(cards,key){const buckets=new Map();for(const c of [...cards].sort(suitRank)){const k=key(c);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(c);}const groups=[],rest=[];for(const bucket of buckets.values()){while(bucket.length>=2)groups.push(bucket.splice(0,2));rest.push(...bucket);}return {groups,rest};}
function meldGroups(cards,seen,tip,options={}){
 const candidates=[];for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++)for(let k=j+1;k<cards.length;k++){const group=[cards[i],cards[j],cards[k]];if(seen&&tip?meld(group,tip):pureMeld(group,options))candidates.push({group,mask:(1<<i)|(1<<j)|(1<<k),pure:pureMeld(group,options)});}
 candidates.sort((a,b)=>Number(b.pure)-Number(a.pure)||suitRank(a.group[0],b.group[0]));
 let best=[],visits=0;function search(start,used,groups){if(groups.length>best.length)best=groups;if(++visits>5000||best.length===Math.floor(cards.length/3))return;for(let i=start;i<candidates.length;i++){const c=candidates[i];if(!(used&c.mask))search(i+1,used|c.mask,[...groups,c.group]);if(visits>5000)return;}}search(0,0,[]);
 const ids=new Set(best.flat().map(c=>c.id));return {groups:best.map(g=>g.sort(suitRank)),rest:cards.filter(c=>!ids.has(c.id)).sort(suitRank)};
}
export function handArrangement(g,p=0,mode='auto'){
 const cards=g.hand[p];let groups=[],rest=[...cards],label='Suit and rank',marks=new Map();
 if(g.type==='marriage'){
  const dublee=g.dubleeMode?.[p]||mode==='dublee',seen=!!g.seen?.[p];
  ({groups,rest}=dublee?pairGroups(cards,c=>c.s+c.r):meldGroups(cards,seen,g.tip,g.options||{}));
  label=dublee?'Dublee · exact pairs':seen?'Maal seen · melds and wild cards':'Opening · pure melds';
  if(seen&&g.tip)for(const c of cards)if(wildMarriage(c,g.tip))marks.set(c.id,'wild');
 }else if(g.type==='jutpatti'){
  const wild=cards.filter(c=>c.r===g.wild);({groups,rest}=pairGroups(cards.filter(c=>c.r!==g.wild),c=>c.r));
  for(const c of wild)marks.set(c.id,'wild');rest.push(...wild);
  label=isJut(cards,g.wild)?'Jut ready':`${groups.length} pairs · ${rest.length-wild.length} unpaired · ${wild.length} wild`;
 }else if(g.type==='faras'){
  if(!g.seen?.[p]&&!g.over)return {cards:[...cards],groups:[],marks,label:'Blind hand'};
  const category=threeRank(cards,g.options?.aceLowBest??true)[0];label=['','Top only','Pair / Dublee','Colour','Run','Pure run','Trial'][category];
  rest.sort(descending);if(category===2){const r=threeRank(cards)[1];rest.sort((a,b)=>Number(b.r===r)-Number(a.r===r)||descending(a,b));}else if((category===4||category===5)&&rest.map(c=>c.r).join()==='14,3,2')rest.sort((a,b)=>(b.r===14?1:b.r)-(a.r===14?1:a.r));
  if(category>1){groups=[rest];rest=[];}
 }else rest.sort(suitRank);
 groups.forEach((group,i)=>group.forEach(c=>{if(!marks.has(c.id))marks.set(c.id,`group-${i%3}`);}));
 return {cards:[...groups.flat(),...rest],groups,marks,label};
}
export function sortHand(g,p=0,mode='auto'){clearManualHand(g,p);const arrangement=handArrangement(g,p,mode);g.hand[p]=arrangement.cards;return arrangement;}

const manualHands=new Map();
const manualKey=(g,p)=>g.type+':'+p+':'+(g.handOrderKey||g.coinRound?.id||g.createdAt||(g.createdAt=Date.now()+':'+Math.random()));
export function rememberHand(g,p=0){const ids=g.hand[p].filter(Boolean).map(c=>c.id);manualHands.set(manualKey(g,p),ids);if(manualHands.size>50)manualHands.delete(manualHands.keys().next().value);g.manualOrder=ids;}
export function restoreHand(g,p=0){const ids=g.manualOrder||manualHands.get(manualKey(g,p));if(!ids||!g.hand[p].some(c=>c&&ids.includes(c.id)))return false;const order=new Map(ids.map((id,i)=>[id,i]));g.hand[p].sort((a,b)=>(order.get(a?.id)??1000)-(order.get(b?.id)??1000));return true;}
export function clearManualHand(g,p=0){delete g.manualOrder;manualHands.delete(manualKey(g,p));}

export const NEPALI_NAMES=['Hari','Gopal','Govinda','Ramesh','Suman','Shyam','Suresh','Mahesh','Aayush','Aarav','Anjali','Sabina','Ram','Laxmi','Krishna','Dhan','Sita','Sunita','Chandra','Kamala','Bishnu','Prem'];
export function playerName(g,p){return g.names?.[p]??(p===0?'You':NEPALI_NAMES[(p-1)%NEPALI_NAMES.length]);}
export function botNames(count,nickname='You',previous=[]){const pool=shuffle(NEPALI_NAMES.filter(n=>n.toLowerCase()!==nickname.toLowerCase())),used=new Set([nickname.toLowerCase()]),names=[nickname];for(let p=1;p<count;p++){const old=previous[p],name=old&&!/^Bot \d+$/.test(old)&&!used.has(old.toLowerCase())?old:pool.find(n=>!used.has(n.toLowerCase()));names.push(name);used.add(name.toLowerCase());}return names;}
export const GAME_LIST=[
 {id:'marriage',name:'Marriage',ne:'म्यारिज',icon:'♥',desc:'Maal, seen & unseen. Every point accounted for.',mode:'Play + score',players:4},
 {id:'callbreak',name:'Call Break',ne:'कल ब्रेक',icon:'♠',desc:'Call your tricks. Keep your promise.',mode:'Play + score',players:4},
 {id:'dhumbal',name:'Dhumbal',ne:'धुम्बल',icon:'♦',desc:'A lighter hand. A well-timed Jhyap.',mode:'Play + score',players:3},
 {id:'daharmara',name:'Dahar Mara',ne:'दहलमारा',icon:'10',desc:'Capture the tens. Play for your team.',mode:'Play + score',players:2},
 {id:'kitti',name:'Kitti',ne:'किट्टी',icon:'♣',desc:'Nine cards. Three hands. Find your split.',mode:'Play + score',players:3},
 {id:'faras',name:'Faras',ne:'फरास',icon:'A',desc:'Three cards. A little nerve. Virtual chips.',mode:'Play + score',players:3},
 {id:'jutpatti',name:'Jutpatti',ne:'जुटपत्ती',icon:'✦',desc:'Bring your pairs together. Declare Jut.',mode:'Play + score',players:3}
];
export function integer(v,min=0,max=100000){const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`Enter a whole number between ${min} and ${max}.`);return n;}
export function callDealConfig(players=4){integer(players,2,10);const cardsPerPlayer=Math.floor(52/players),removeCount=52%players;const order=['H','D','C','S'];const removed=deck().sort((a,b)=>a.r-b.r||order.indexOf(a.s)-order.indexOf(b.s)).slice(0,removeCount);return {players,cardsPerPlayer,totalTricks:cardsPerPlayer,removed};}
export function callScore(bid,tricks,maxTricks=13){integer(maxTricks,1,26);integer(bid,1,maxTricks);integer(tricks,0,maxTricks);return tricks<bid?-bid:Math.round((bid+(tricks-bid)/10)*10)/10;}
export function tableNotice(game,players){integer(players,2,17);if(game==='callbreak'){const c=callDealConfig(players);return `${players===4?'Standard four-player game.':'House variant: standard Call Break has four players.'} ${players} players, ${c.cardsPerPlayer} cards each, ${c.totalTricks} tricks per deal.${c.removed.length?' Remove '+c.removed.map(c=>rank(c.r)+suit(c.s)).join(', ')+' before dealing.':' Use all 52 cards.'}`;}if(game==='marriage')return `${players} players. ${players===4?'Four is the default; Marriage also supports two or three players.':players<=5?'Marriage can be played with two to five players using three decks.':players<=7?'House variant: 21 cards each leaves a short drawing stock with three decks.':'Scorekeeping supports this table size. More than seven players need additional decks or a changed deal; three decks cannot provide 21 cards each.'}`;if(game==='dhumbal')return players>5?'House variant: six or seven players. Usual Dhumbal tables have two to five.':'Dhumbal supports two to five players; six or seven are house variants.';if(game==='faras')return 'Faras supports two to seventeen players, with three cards each.';if(game==='daharmara')return 'Exactly four players in two fixed teams. The scorekeeper records two team names.';return '';}
export const DEFAULT_MARRIAGE={seen:3,unseen:10,dublee:5,unseenMaal:'count',dubleeExempt:false,dealerFoulPoints:15,playFoulPoints:15,foulReplacesFee:false,doubleEnabled:false,alter:false,alterPoints:5,tunnelaPoints:5,tunnelaScale:'rank',maalTiming:'immediate',printedJokers:false};
export const NEPAL_MARRIAGE={...DEFAULT_MARRIAGE,scoringProfile:'nepal',unseenMaal:'murder',printedJokers:true,alter:true,tunnelaScale:'flat',tunnelaTiming:'initial'};
export const BHOOS_MARRIAGE={...NEPAL_MARRIAGE,scoringProfile:'bhoos',masterEnabled:false,supermanEnabled:true,supermanInOpening:true};
export function marriageCalculation(rows,winner,rules=DEFAULT_MARRIAGE,dublee=false,double=false){
 const r={...DEFAULT_MARRIAGE,...rules};['seen','unseen','dublee'].forEach(k=>integer(r[k]));
 if(!['murder','kidnap','count'].includes(r.unseenMaal))throw Error('Choose an unseen maal rule.');
 if(rows.some(p=>p.status&&!['seen','unseen','dublee','out'].includes(p.status)))throw Error('Choose a valid player status.');
 const players=rows.map((p,i)=>({...p,i,maal:integer(p.maal),status:p.status||'seen'})),active=players.filter(p=>p.status!=='out');
 if(active.length<2)throw Error('At least two players must participate.');
 if(winner!==null&&!active.some(p=>p.i===winner&&['seen','dublee'].includes(p.status)))throw Error('The winner must be playing and have seen the maal.');
 let stolen=0;const maal=active.map(p=>{if(p.status==='unseen'&&r.unseenMaal!=='count'){stolen+=p.maal;return 0;}return p.maal;});
 if(r.unseenMaal==='kidnap'&&winner!==null)maal[active.findIndex(p=>p.i===winner)]+=stolen;
 const total=maal.reduce((a,b)=>a+b,0),factor=double||(r.doubleEnabled&&(dublee||active.some(p=>p.status==='dublee')))?2:1,wonDublee=winner!==null&&(dublee||active.find(p=>p.i===winner)?.status==='dublee');
 const details=players.map(p=>({player:p.i,status:p.status,enteredMaal:p.maal,countedMaal:0,base:0,fee:0,feeBase:0,feeBonus:0,feeReason:p.status==='out'?'out':winner===null?'noWinner':p.i===winner?'winner':'seen',received:0}));
 active.forEach((p,j)=>{const d=details[p.i];d.countedMaal=maal[j];d.base=active.length*maal[j]-total;if(winner!==null&&p.i!==winner){d.feeReason=p.skipWinningFee?'foulReplaces':p.status==='dublee'&&r.dubleeExempt?'dubleeExempt':p.status==='unseen'?'unseen':'seen';d.feeBase=p.skipWinningFee||d.feeReason==='dubleeExempt'?0:p.status==='unseen'?r.unseen:r.seen;d.feeBonus=p.skipWinningFee?0:wonDublee?r.dublee:0;d.fee=d.feeBase+d.feeBonus;details[winner].received+=d.fee;}});
 const scores=details.map(d=>(d.base-d.fee+d.received)*factor);
 return {scores,players:details,totalMaal:total,activeCount:active.length,factor,winner,wonDublee,unseenMaal:r.unseenMaal,unseenMaalRemoved:stolen,unseenMaalTransferred:r.unseenMaal==='kidnap'&&winner!==null?stolen:0};
}
export function marriageScore(rows,winner,rules=DEFAULT_MARRIAGE,dublee=false,double=false){return marriageCalculation(rows,winner,rules,dublee,double).scores;}

export function dhumbalScore(totals,caller,limit=5,penalty=25){totals.forEach(x=>integer(x,0,100));integer(caller,0,totals.length-1);integer(limit,0,100);integer(penalty);if(totals[caller]>limit)throw Error('Caller exceeds the agreed call limit.');const success=totals.every((v,i)=>i===caller||v>totals[caller]);return totals.map((v,i)=>i===caller?(success?0:penalty):v);}
export function settlements(totals){if(Math.abs(totals.reduce((a,b)=>a+b,0))>0.001)throw Error('Only a balanced scoreboard can be settled.');const credit=totals.map((n,i)=>({n,i})).filter(x=>x.n>0),debt=totals.map((n,i)=>({n:-n,i})).filter(x=>x.n>0),out=[];for(const d of debt)for(const c of credit){const n=Math.min(d.n,c.n);if(n>0){out.push({from:d.i,to:c.i,points:n});d.n-=n;c.n-=n;}}return out;}
export function totalsFor(session){return session.names.map((_,i)=>Math.round(session.rounds.reduce((n,r)=>n+r.scores[i],0)*10)/10);}
export function deck(packs=1){return Array.from({length:packs},(_,p)=>['S','H','D','C'].flatMap(s=>Array.from({length:13},(_,i)=>({id:`${p}${s}${i+2}`,s,r:i+2})))).flat();}
export function secureRandom(){if(globalThis.crypto?.getRandomValues){const out=new Uint32Array(1);crypto.getRandomValues(out);return out[0]/4294967296;}throw Error('Secure randomness is unavailable. Update your browser.');}
export function shuffle(cards,rng=secureRandom){const a=[...cards];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const rank=r=>({11:'J',12:'Q',13:'K',14:'A',15:'Jkr',16:'★',17:'S'}[r]||String(r));
export const suit=s=>({S:'♠',H:'♥',D:'♦',C:'♣',J:'✦',M:'★',U:'✧'}[s]);
export function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
export function threeRank(cards,aceLowBest=false){if(cards.length!==3)throw Error('A hand requires three cards.');const r=cards.map(c=>c.r).sort((a,b)=>b-a),flush=cards.every(c=>c.s===cards[0].s),low=r.join()==='14,3,2',straight=low||(r[0]-r[1]===1&&r[1]-r[2]===1);if(r[0]===r[2])return [6,r[0]];if(straight){const h=low?(aceLowBest?15:13.5):r[0];return [flush?5:4,h];}if(flush)return [3,...r];if(r[0]===r[1]||r[1]===r[2])return [2,r[1],r[0]===r[1]?r[2]:r[0]];return [1,...r];}
export const handLabel=cards=>['','High card','Pair','Colour','Run','Pure run','Trail'][threeRank(cards)[0]];
export function isJut(cards,wild){if(cards.length%2)return false;let wilds=0;const counts={};cards.forEach(c=>{if(c.r===wild)wilds++;else counts[c.r]=(counts[c.r]||0)+1;});return Object.values(counts).filter(n=>n%2).length<=wilds;}
export function trickWinner(trick,trump='S'){const led=trick[0].card.s;return trick.reduce((best,t)=>{const b=best.card,c=t.card;return (c.s===b.s&&c.r>b.r)||(c.s===trump&&b.s!==trump)||(c.s===led&&b.s!==trump&&b.s!==led)?t:best;}).player;}
export function legalCards(hand,trick){if(!trick.length)return hand;const led=trick[0].card.s,follow=hand.filter(c=>c.s===led),trumps=hand.filter(c=>c.s==='S');const pool=follow.length?follow:trumps.length?trumps:hand;const winning=trick.find(t=>t.player===trickWinner(trick)).card;const beat=pool.filter(c=>trickWinner([...trick,{player:-1,card:c}])===-1);return beat.length?beat:pool;}

// Observe committed card changes. Selection, sorting and reconnects never replay a move.
const local=new WeakMap(),remote=new Map();
export function motionSnapshot(g){return {type:g.type,sequence:g.dealSequence||0,turn:g.turn,phase:g.phase,stock:g.stockCount??g.stock?.length??0,hands:g.hand.map(h=>h.filter(Boolean).map(c=>({...c}))),pile:g.pile?.at(-1)?{...g.pile.at(-1)}:null,trick:(g.trick?.length?g.trick:g.lastTrick||[]).map(x=>({player:x.player,card:{...x.card}}))};}
export function cardTransitions(before,after){
 if(!before||(before.sequence||0)!==(after.sequence||0)||before.type!==after.type||before.hands.length!==after.hands.length)return [];
 const moves=[];
 for(let p=0;p<after.hands.length;p++){
  const old=new Set(before.hands[p].map(c=>c.id));
  const added=after.hands[p].filter(c=>!old.has(c.id));
  for(const card of added) moves.push({kind:'draw',player:p,card,source:before.pile?.id===card.id?'pile':'stock'});
 }
 if(after.pile&&before.pile?.id!==after.pile.id){const p=before.hands.findIndex(h=>h.some(c=>c.id===after.pile.id));moves.push({kind:'discard',player:p<0?before.turn:p,card:after.pile});}
 for(const play of after.trick)if(!before.trick.some(x=>x.card.id===play.card.id))moves.push({kind:'play',player:play.player,card:play.card});
 // An online opponent's concealed hand may keep a stable count after a complete draw/discard.
 if(after.stock<before.stock&&!moves.some(x=>x.kind==='draw')&&moves.some(x=>x.kind==='discard'))moves.unshift({kind:'draw',player:before.turn,source:'stock',card:null});
 return moves;
}
export function animateTableMotion(g,viewer,root,roomKey=null){
 if(!g)return;const cache=roomKey?remote:local,key=roomKey||g,before=cache.get(key),after=motionSnapshot(g);cache.set(key,after);if(remote.size>20)remote.delete(remote.keys().next().value);
 if(!before||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const table=root.querySelector('.table-layout');if(!table)return;
 const seat=p=>p===viewer?root.querySelector('.my-hand'):root.querySelector(`[data-seat="${p}"]`);
 const pile=root.querySelector('.discard-card'),stock=root.querySelector('.stock-card');
 const fly=(move,index)=>{
  const target=move.kind==='draw'?seat(move.player):move.kind==='discard'?pile:root.querySelector('.table-middle');
  const source=move.kind==='draw'?(move.source==='pile'?pile:stock):seat(move.player);if(!source||!target)return;
  const revealed=move.kind!=='draw'||move.player===viewer;
  const sample=revealed&&move.card?(move.kind==='draw'?root.querySelector(`.my-hand [data-id="${CSS.escape(String(move.card.id))}"]`):move.kind==='discard'?pile?.querySelector('.playing-card'):root.querySelector(`.table-middle [data-motion-id="${CSS.escape(String(move.card.id))}"]`)):stock;
  const face=sample||stock||root.querySelector('.playing-card');if(!face)return;
  const ghost=face.cloneNode(true);ghost.classList.add('card-flight');ghost.classList.remove('selected','card-arrival','bot-card-move');ghost.removeAttribute('id');ghost.removeAttribute('data-action');ghost.removeAttribute('data-id');ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;
  if(!revealed){ghost.className='playing-card back card-flight';ghost.innerHTML='✦';}
  const a=source.getBoundingClientRect(),b=target.getBoundingClientRect(),width=48,height=68;
  Object.assign(ghost.style,{left:'0px',top:'0px',width:width+'px',height:height+'px',padding:'4px',animation:'none'});document.body.append(ghost);
  const pos=(r,tilt)=>`translate(${r.x+r.width/2-width/2}px,${r.y+r.height/2-height/2}px) rotate(${tilt}deg)`;
  const animation=ghost.animate([{transform:pos(a,-14),opacity:.9},{transform:pos(b,5),opacity:1}],{duration:440,delay:index*280,easing:'cubic-bezier(.2,.7,.25,1)',fill:'both'});animation.finished.then(()=>ghost.remove(),()=>ghost.remove());
 };
 cardTransitions(before,after).slice(-4).forEach(fly);
}

// Animate only newly committed actions, never replay a bet after sorting or resume.
const seen=new WeakMap(),remoteSeen=new Map();
export function animateFarasMotion(g,viewer,root,roomKey=null){
 const sequence=g.betSequence||0,cache=roomKey?remoteSeen:seen,key=roomKey||g,previous=cache.get(key);cache.set(key,{sequence,pack:g.packSequence||0});if(remoteSeen.size>20)remoteSeen.delete(remoteSeen.keys().next().value);if(previous===undefined||previous.sequence===sequence&&(previous.pack||0)===(g.packSequence||0))return;
 const table=root.querySelector('.faras-table'),pot=root.querySelector('.faras-pot');if(!table||!pot)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return;
 const seat=p=>p===viewer?root.querySelector('.my-wallet'):root.querySelector(`[data-seat="${p}"] .seat-wallet`);
 const fly=(from,to,amount,delay=0)=>{
  if(!from||!to)return;const base=table.getBoundingClientRect(),a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
  const chip=document.createElement('span');chip.className='chip-flight';chip.textContent=String(amount);chip.setAttribute('aria-hidden','true');table.append(chip);
  const translate=box=>`translate(${box.x-base.x+box.width/2-19}px,${box.y-base.y+box.height/2-19}px)`;
  chip.style.transform=translate(a);const animation=chip.animate([{transform:translate(a)+' scale(.85)',opacity:0},{opacity:1,offset:.12},{transform:translate(b)+' rotate(150deg) scale(1)',opacity:1}],{duration:650,delay,easing:'cubic-bezier(.2,.7,.25,1)',fill:'both'});
  animation.finished.then(()=>chip.remove(),()=>chip.remove());
 };
 if((g.packSequence||0)>(previous.pack||0)){const source=g.lastPacked===viewer?root.querySelector('.my-hand'):root.querySelector(`[data-seat="${g.lastPacked}"]`),from=source?.getBoundingClientRect(),to=pot.getBoundingClientRect();if(from)for(let i=0;i<3;i++){const card=document.createElement('span');card.className='playing-card back packed-card-flight';card.textContent='✦';Object.assign(card.style,{position:'fixed',left:(from.x+from.width/2)+'px',top:(from.y+from.height/2)+'px',width:'58px',height:'82px',zIndex:60,pointerEvents:'none'});document.body.append(card);const a=card.animate([{transform:`rotate(${i*12}deg)`,opacity:1},{transform:`translate(${to.x-from.x-from.width/2}px,${to.y-from.y-from.height/2}px) rotate(${i*20-20}deg)`,opacity:0}],{duration:650,delay:i*80,easing:'ease-in'});a.finished.then(()=>card.remove(),()=>card.remove());}}
 if(g.lastBet&&g.lastBet.id>previous.sequence)fly(seat(g.lastBet.player),pot,g.lastBet.amount);
 if(g.lastPayout&&g.lastPayout.id>previous.sequence)for(const p of g.lastPayout.winners)fly(pot,seat(p),g.lastPayout.amount/g.lastPayout.winners.length,g.lastBet?.id>previous.sequence?450:0);
}

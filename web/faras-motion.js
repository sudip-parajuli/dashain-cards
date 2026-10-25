// Animate only newly committed actions, never replay a bet after sorting or resume.
const seen=new WeakMap(),remoteSeen=new Map();
export function animateFarasMotion(g,viewer,root,roomKey=null){
 const sequence=g.betSequence||0,cache=roomKey?remoteSeen:seen,key=roomKey||g,previous=cache.get(key);cache.set(key,sequence);if(remoteSeen.size>20)remoteSeen.delete(remoteSeen.keys().next().value);if(previous===undefined||previous===sequence)return;
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
 if(g.lastBet&&g.lastBet.id>previous)fly(seat(g.lastBet.player),pot,g.lastBet.amount);
 if(g.lastPayout&&g.lastPayout.id>previous)for(const p of g.lastPayout.winners)fly(pot,seat(p),g.lastPayout.amount/g.lastPayout.winners.length,g.lastBet?.id>previous?450:0);
}

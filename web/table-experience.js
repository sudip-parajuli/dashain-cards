import {localize} from './i18n.js';
import {playerName} from './core.js';
const local=new WeakMap(),online=new Map(),dealt=new Set();let intro=null;try{for(const id of JSON.parse(sessionStorage.getItem('dashain-deal-motion')||'[]'))if(typeof id==='string')dealt.add(id);}catch{}
export function roundWinners(g){
 if(!g.over)return [];
 if(g.type==='daharmara'&&Number.isInteger(g.teamWinner))return g.hand.map((_,p)=>p).filter(p=>p%2===g.teamWinner);
 if(Array.isArray(g.winners))return g.winners;
 if(Number.isInteger(g.winner))return [g.winner];
 if(g.type==='kitti')return [];
 const best=g.type==='dhumbal'?Math.min(...g.scores):Math.max(...g.scores);return g.scores.map((s,p)=>s===best?p:-1).filter(p=>p>=0);
}
export function dealPlan(g){const n=g.hand.length,direction=g.options?.revealDirection==='anticlockwise'?-1:1,start=((g.dealer??n-1)+direction+n)%n,count=g.hand.map((h,p)=>{const own=new Set(h.filter(Boolean).map(c=>c.id));return h.length+new Set([...(g.exposed?.[p]||[]),...(g.tunnelas?.[p]?.flat()||[])].filter(c=>!own.has(c.id)).map(c=>c.id)).size;}),plan=[];for(let i=0;i<Math.max(...count);i++)for(let q=0;q<n;q++){const p=(start+q*direction+n*2)%n;if(i<count[p])plan.push(p);}return plan;}

export function celebrationPayout(g,viewer=0,presentation={}){
 const online=presentation.online===true,entry=g.coinRound,delta=online?g.chipChanges?.[viewer]:entry?.settled?(viewer===0?entry.delta:entry.changes?.[viewer]??(g.type==='faras'?g.bank?.[viewer]-g.startBank?.[viewer]:null)):null;
 if(!Number.isFinite(delta))return null;
 const format=n=>String(Math.round(n*100)/100),unit=online?'chips':'coins',value=(delta>0?'+':'')+format(delta);
 return {delta,unit,value,amount:online&&Number.isFinite(presentation.chipValue)?'Rs '+format(delta*presentation.chipValue):null,returned:!online&&viewer===0&&entry?.pot&&!entry.rules?.coinsPerPoint&&Number.isFinite(entry.returned)&&entry.returned>0?format(entry.returned):null};
}
function celebration(g,viewer,root,audio,presentation){
 const winners=roundWinners(g),won=winners.includes(viewer),dialog=document.createElement('dialog');dialog.className='win-celebration';
 const crown=document.createElement('div');crown.className='victory-crown';crown.textContent=winners.length?'♛':'✦';crown.setAttribute('aria-hidden','true');
 const eyebrow=document.createElement('p');eyebrow.className='victory-eyebrow';eyebrow.textContent=won?'WHAT A HAND!':'ONE MORE ROUND?';
 const title=document.createElement('h2');title.textContent=g.callMatch?.outcome==='eight-failed'?'8-call penalty':!winners.length?'A closely fought draw':won?'You won!':winners.map(p=>playerName(g,p)).join(' & ')+' won!';
 const note=document.createElement('p');note.textContent=g.callMatch?.outcome==='eight-failed'?playerName(g,g.callMatch.eightPlayer)+' failed an 8-call. Match ended.':winners.length?'Good cards. Better company.':'Shuffle up and try again.';
 const payout=celebrationPayout(g,viewer,presentation),money=document.createElement('div');money.className='victory-payout';
 if(payout){const label=document.createElement('small');label.textContent=payout.delta>0?'Your net winnings':'Your net result';const total=document.createElement('strong');total.append(document.createTextNode(payout.value+' '));const unit=document.createElement('span');unit.textContent=payout.unit;total.append(unit);money.append(label,total);if(payout.amount){const equivalent=document.createElement('small');equivalent.textContent=payout.amount;money.append(equivalent);}if(payout.returned){const returned=document.createElement('small'),caption=document.createElement('span');caption.textContent='Returned including own boot';returned.append(caption,document.createTextNode(' · '+payout.returned+' '));const coins=document.createElement('span');coins.textContent='coins';returned.append(coins);money.append(returned);}}
 for(const winner of winners.filter(p=>p!==viewer)){const result=celebrationPayout(g,winner,presentation);if(!result)continue;const line=document.createElement('small'),name=document.createElement('span');name.dataset.userText='';name.textContent=playerName(g,winner);const unit=document.createElement('span');unit.textContent=result.unit;line.append(name,document.createTextNode(' · '+result.value+' '),unit);money.append(line);}
 const buttons=document.createElement('div');buttons.className='victory-actions';
 if(!presentation?.online||presentation.owner){const next=document.createElement('button');next.textContent=presentation?.online?'New deal':'Save & new deal';next.dataset.action=presentation?.online?'nextdeal':'savenextdeal';buttons.append(next);}
 const detail=document.createElement('button');detail.textContent='See round scores';detail.addEventListener('click',()=>{dialog.close();root.querySelector('#table-result')?.showModal();});
 const close=document.createElement('button');close.className='secondary';close.textContent='Back to table';close.addEventListener('click',()=>dialog.close());buttons.append(detail,close);
 const confetti=document.createElement('div');confetti.className='victory-confetti';confetti.setAttribute('aria-hidden','true');for(let i=0;i<36;i++){const bit=document.createElement('i');bit.style.cssText=`--i:${i};--x:${(i*37)%100}%;--delay:${(i%9)*.075}s;--hue:${[42,12,156,270][i%4]}`;confetti.append(bit);}
 dialog.append(confetti,crown,eyebrow,title,money,note,buttons);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);localize(dialog);dialog.showModal();
 // Audio observation owns the once-per-result cue; opening a scoreboard never repeats it.
}
function deal(g,viewer,root,audio,onDone){
 const table=root.querySelector('.table-layout');if(!table)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return;
 intro=document.createElement('div');intro.className='deal-intro';intro.setAttribute('role','status');intro.innerHTML='<div class="shuffle-pack" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div><strong>Shuffling…</strong><button type="button">Skip animation</button>';document.body.append(intro);localize(intro);table.inert=true;
 const handCards=[...table.querySelectorAll('.my-hand .playing-card')],hidden=[...table.querySelectorAll('.my-hand .playing-card,.public-melds .playing-card,.table-ground .playing-card')];for(const card of hidden)card.classList.add('dealing-hidden');intro.revealed=0;
 const ghosts=[],animations=[];let timer,ownIndex=0;
 const end=()=>{if(!intro)return;clearTimeout(timer);for(const card of root.querySelectorAll('.dealing-hidden'))card.classList.remove('dealing-hidden');for(const a of animations)a.cancel();for(const node of ghosts)node.remove();intro.remove();intro=null;root.querySelector('.table-layout')?.removeAttribute('inert');onDone?.();};intro.finish=end;intro.querySelector('button').addEventListener('click',end,{once:true});
 const center=table.querySelector('.stock-card')||table.querySelector('.table-middle'),origin=center.getBoundingClientRect(),plan=dealPlan(g),step=Math.min(38,1500/Math.max(plan.length,1));
 for(const [i,p]of plan.entries()){
  const target=p===viewer?table.querySelector('.my-hand'):table.querySelector(`[data-seat="${p}"]`);if(!target)continue;
  const arrivingIndex=p===viewer?ownIndex++:-1,arriving=handCards[arrivingIndex],rect=(arriving||target).getBoundingClientRect(),ghost=document.createElement('span');ghost.className='deal-card';ghost.textContent='✦';ghost.setAttribute('aria-hidden','true');document.body.append(ghost);ghosts.push(ghost);
  const pos=(r,rotation)=>`translate(${r.x+r.width/2-17}px,${r.y+r.height/2-24}px) rotate(${rotation}deg)`;
  const anim=ghost.animate([{transform:pos(origin,-10),opacity:0},{opacity:1,offset:.08},{transform:pos(rect,(i%5-2)*5),opacity:0}],{duration:300,delay:600+i*step,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});animations.push(anim);if(arriving)anim.finished.then(()=>{arriving.classList.remove('dealing-hidden');root.querySelectorAll('.my-hand .playing-card')[arrivingIndex]?.classList.remove('dealing-hidden');if(intro)intro.revealed=Math.max(intro.revealed,arrivingIndex+1);},()=>{});
 }
 audio.play('deal',.55);setTimeout(()=>{if(intro)intro.querySelector('strong').textContent='Dealing cards…';},600);timer=setTimeout(end,950+plan.length*step);
}
export function hasNewKittiCollection(g,previousWins=0){const s=g.showdown,wins=s?.roundWinners.length||0;return !!s&&wins>previousWins&&wins===s.round+1&&s.revealed.length===g.hand.length;}
function collectKitti(g,viewer,root,audio,reduced){
 const winners=g.showdown.roundWinners.at(-1),cards=[...root.querySelectorAll('.showdown-player .playing-card')];
 if(reduced){for(const card of cards)card.style.opacity='0';return;}
 for(const [i,card]of cards.entries()){
  const winner=winners[Math.floor(i/3)%winners.length],target=winner===viewer?root.querySelector('.hand-area'):root.querySelector(`[data-seat="${winner}"]`);if(!target)continue;
  const from=card.getBoundingClientRect(),to=target.getBoundingClientRect(),ghost=card.cloneNode(true);ghost.classList.add('kitti-won-flight');ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('data-action');
  Object.assign(ghost.style,{left:from.x+'px',top:from.y+'px',width:from.width+'px',height:from.height+'px'});document.body.append(ghost);
  const dx=to.x+to.width/2-from.x-from.width/2,dy=to.y+to.height/2-from.y-from.height/2,delay=650+i*16;
  card.animate([{opacity:1},{opacity:0}],{delay,duration:100,fill:'forwards'});
  const flight=ghost.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx*.45}px,${dy*.45-30}px) rotate(12deg)`,offset:.5},{transform:`translate(${dx}px,${dy}px) rotate(-5deg) scale(.6)`,opacity:0}],{delay,duration:600,easing:'cubic-bezier(.3,.1,.3,1)',fill:'both'});flight.finished.then(()=>ghost.remove(),()=>ghost.remove());
 }
 audio.play('deal',.8);
}
function collectTrick(g,viewer,root,audio,reduced,onDone){
 const cards=[...root.querySelectorAll('.table-middle .deck-zone .playing-card')],target=g.lastTrickWinner===viewer?root.querySelector('.hand-area'):root.querySelector(`[data-seat="${g.lastTrickWinner}"]`),table=root.querySelector('.table-layout');if(!target||cards.length!==g.hand.length)return;
 if(reduced){cards.forEach(c=>c.style.visibility='hidden');return;}table.classList.add('trick-collecting');table.inert=true;
 const to=target.getBoundingClientRect();for(const [i,card]of cards.entries()){const from=card.getBoundingClientRect(),ghost=card.cloneNode(true);ghost.classList.add('trick-won-flight');ghost.removeAttribute('data-action');ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{left:from.x+'px',top:from.y+'px',width:from.width+'px',height:from.height+'px'});document.body.append(ghost);const dx=to.x+to.width/2-from.x-from.width/2,dy=to.y+to.height/2-from.y-from.height/2;card.animate([{opacity:1},{opacity:0}],{delay:450,duration:100,fill:'forwards'});const a=ghost.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${(i-1)*9}deg) scale(.6)`,opacity:0}],{delay:450+i*35,duration:600,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});a.finished.then(()=>ghost.remove(),()=>ghost.remove());}
 audio.play('deal',.45);setTimeout(()=>{table.classList.remove('trick-collecting');table.removeAttribute('inert');onDone?.(true);},1200);
}
export function animateTableExperience(g,viewer,root,audio,roomKey,onDone,presentation={}){
 const cache=roomKey?online:local,key=roomKey||g,previous=cache.get(key),sequence=g.dealSequence||0,before=previous?.sequence===sequence?previous:null,wins=g.showdown?.roundWinners.length||0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 cache.set(key,{over:g.over,sequence,trick:g.trickSequence||0,reveal:g.showdown?g.showdown.round+':'+g.showdown.revealed.length:null,wins});if(online.size>40)online.delete(online.keys().next().value);
 const identity=String(roomKey||g.coinRound?.id||g.type)+':'+sequence,table=root.querySelector('.table-layout');if(table)table.dataset.dealPresentation=identity;
 if(intro&&g.over){intro.finish();celebration(g,viewer,root,audio,presentation);return;}
 if(intro){table?.setAttribute('inert','');[...root.querySelectorAll('.my-hand .playing-card')].forEach((card,i)=>card.classList.toggle('dealing-hidden',i>=intro.revealed));for(const card of root.querySelectorAll('.public-melds .playing-card,.table-ground .playing-card'))card.classList.add('dealing-hidden');return;}
 if(before&&g.showdown&&before.reveal!==g.showdown.round+':'+g.showdown.revealed.length&&!reduced){const p=g.showdown.revealed.at(-1);for(const card of root.querySelectorAll(`[data-show-seat="${p}"] .playing-card`))card.animate([{transform:'rotateY(90deg)',opacity:.2},{transform:'rotateY(0)',opacity:1}],{duration:500,easing:'ease-out'});}
 const trickCollecting=!!before&&g.type==='callbreak'&&(g.trickSequence||0)>before.trick&&g.lastTrick?.length===g.hand.length;if(trickCollecting)collectTrick(g,viewer,root,audio,reduced,onDone);else if(before&&g.type==='callbreak'&&g.lastTrick?.length&&!g.trick.length)for(const card of root.querySelectorAll('.table-middle .deck-zone .playing-card'))card.style.visibility='hidden';
 const collecting=!!before&&hasNewKittiCollection(g,before.wins||0);
 if(collecting)collectKitti(g,viewer,root,audio,reduced);else if(g.showdown?.awaitingNext||g.over&&g.showdown)for(const card of root.querySelectorAll('.showdown-player .playing-card'))card.style.opacity='0';
 if(before&&!before.over&&g.over){if((collecting||trickCollecting)&&!reduced)setTimeout(()=>{if(root.querySelector('.table-layout')?.dataset.dealPresentation===identity&&root.querySelector('#table-result'))celebration(g,viewer,root,audio,presentation);},collecting?1650:1250);else celebration(g,viewer,root,audio,presentation);return;}
 if(before||g.over)return;const id=roomKey||g.coinRound?.id?identity:g;
 if(dealt.has(id))return;dealt.add(id);if(dealt.size>80)dealt.delete(dealt.values().next().value);try{sessionStorage.setItem('dashain-deal-motion',JSON.stringify([...dealt].filter(x=>typeof x==='string')));}catch{}
 if((g.groups?.length||0)>0||(g.steps||0)>0||(g.pile?.length||0)>1||g.showdown||g.type==='callbreak'&&g.phase!=='bid'||g.type==='faras'&&(g.actionLog?.length||0)>0)return;
 deal(g,viewer,root,audio,onDone);
}

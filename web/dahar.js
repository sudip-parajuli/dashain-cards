import {playerName,deck,shuffle,trickWinner} from './core.js';
export function newDahar(options={}){
 const stock=shuffle(deck()),trump=['S','H','D','C'].includes(options.trump)?options.trump:options.trump==='auto'?null:stock[0].s,hand=Array.from({length:4},()=>stock.splice(0,13));
 return {type:'daharmara',options,hand,stock,trump,trick:[],lastTrick:[],turn:0,dealer:3,phase:'play',selected:[],over:false,scores:[0,0,0,0],middle:[],captured:[[],[]],capturedByPlayer:[[],[],[],[]],teamTricks:[0,0],previous:null,tricksDone:0,trickSequence:0,message:trump?`Follow suit. Trump is ${trump}.`:'Follow suit. The first off-suit card establishes trump.'};
}
export function daharLegal(g,p){if(!g.trick.length)return g.hand[p];const suit=g.trick[0].card.s,follow=g.hand[p].filter(c=>c.s===suit);return follow.length?follow:g.hand[p];}
export function daharPlay(g,p,id){
 if(g.over||g.turn!==p)throw Error('Wait for your turn.');const c=daharLegal(g,p).find(c=>c.id===id);if(!c)throw Error('Follow the led suit when you can.');
 if(g.trick.length&&!g.trump&&c.s!==g.trick[0].card.s)g.trump=c.s;
 g.hand[p]=g.hand[p].filter(c=>c.id!==id);g.trick.push({player:p,card:c});if(g.trick.length<4){g.turn=(p+1)%4;return;}
 const winner=trickWinner(g.trick,g.trump),cards=g.trick.map(t=>t.card);if(!g.teamTricks)g.legacyDahar=true;g.teamTricks??=[0,0];g.teamTricks[winner%2]++;g.middle.push(...cards);g.lastTrick=[...g.trick];g.trick=[];g.tricksDone++;
 const capture=g.previous!==null&&(g.options.teamCapture?g.previous%2===winner%2:g.previous===winner)||g.tricksDone===13;
 if(capture){g.lastCollection=[...g.middle];g.lastCollectionSize=g.middle.length;g.lastCapturedAt=g.tricksDone;g.captured[winner%2].push(...g.middle);g.capturedByPlayer??=[[],[],[],[]];g.capturedByPlayer[winner].push(...g.middle);g.middle=[];g.trickSequence=(g.trickSequence||0)+1;g.lastTrickWinner=winner;}
 g.previous=winner;g.turn=winner;if(g.stock.length&&(g.trump||g.tricksDone===5)){if(!g.trump)g.trump=cards[0].s;g.hand.forEach(h=>h.push(...g.stock.splice(0,8)));}const tens=g.captured.map(h=>h.filter(c=>c.r===10).length);
 g.message=`${playerName(g,winner)} won the trick. ${capture?'Collected the centre pile.':'Cards stay in the centre.'} Tens: ${tens.join(' / ')}.`;
 if(g.tricksDone===13){g.over=true;const win=tens[0]===tens[1]?(g.legacyDahar?0:g.teamTricks[0]>g.teamTricks[1]?0:1):(tens[0]>tens[1]?0:1);g.teamWinner=win;g.kot=tens[win]===4;g.scores=g.hand.map((_,p)=>p%2===win?1:0);g.message=`Team ${win+1} wins with ${tens[win]} tens${g.kot?' — Kot!':''}${tens[0]===tens[1]?` and ${g.teamTricks[win]} tricks (2–2 tie-break)`:''}.`;}
}
export function daharBot(g){const p=g.turn,legal=[...daharLegal(g,p)];const strength=c=>c.r+(c.s===g.trump?20:0);legal.sort((a,b)=>strength(a)-strength(b));if(g.trick.length){const winner=trickWinner(g.trick,g.trump);if(winner%2===p%2){const ten=legal.find(c=>c.r===10);daharPlay(g,p,(ten||legal[0]).id);return;}const winning=legal.find(c=>trickWinner([...g.trick,{player:p,card:c}],g.trump)===p);if(winning&&g.trick.some(x=>x.card.r===10)){daharPlay(g,p,winning.id);return;}}daharPlay(g,p,(legal.find(c=>c.r!==10)||legal[0]).id);}

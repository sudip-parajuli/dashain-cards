import test from 'node:test';
import assert from 'node:assert/strict';
import {celebrationPayout} from '../web/table-experience.js';
import {victorySamples} from '../web/audio.js';
import {newGame} from '../web/games.js';
import {newWallet,startCoins,settleCoins} from '../web/wallet.js';

test('Celebration shows settled net coins separately from the returned boot',()=>{
 const wallet=newWallet(),g=newGame('kitti',{players:4,boot:10});startCoins(wallet,g,'payout-test');g.over=true;g.scores=[1,0,0,0];g.winner=0;settleCoins(wallet,g);
 const p=celebrationPayout(g);assert.equal(p.value,'+30');assert.equal(p.unit,'coins');assert.equal(p.returned,'40');assert.equal(p.amount,null);
 assert.equal(celebrationPayout(g,1).value,'-10');assert.equal(celebrationPayout(g,1).returned,null);
 assert.equal(celebrationPayout({...g,coinRound:{settled:false,delta:30}}),null);
 assert.equal(celebrationPayout({...g,coinRound:{settled:true,delta:-10}}).value,'-10');
});
test('Online celebration uses this round’s chips, not cumulative table winnings',()=>{
 const g={chipChanges:[-15,30,-15]};assert.deepEqual(celebrationPayout(g,1,{online:true,chipValue:5}),{delta:30,unit:'chips',value:'+30',amount:'Rs 150',returned:null});assert.equal(celebrationPayout(g,0,{online:true,chipValue:2}).amount,'Rs -30');assert.equal(celebrationPayout({chipChanges:[0]},0,{online:true}).value,'0');
});
test('Victory impact and crowd texture is bounded, deterministic and decays',()=>{
 const a=victorySamples(22050),b=victorySamples(22050);assert.equal(a.length,61740);assert.deepEqual(a,b);assert.ok(a.every(x=>Number.isFinite(x)&&Math.abs(x)<1));assert.ok(a.some(x=>x>.1)&&a.some(x=>x<-.1));const energy=v=>v.reduce((s,n)=>s+n*n,0)/v.length;assert.ok(energy(a.slice(-500))<energy(a.slice(2000,20000)));assert.notDeepEqual(a,victorySamples(22050,74));
});

export const FRIEND_GAMES={
 marriage:{name:'Marriage',min:2,max:5,default:4},
 callbreak:{name:'Call Break',min:3,max:4,default:4},
 dhumbal:{name:'Dhumbal',min:2,max:7,default:3},
 daharmara:{name:'Dahar Mara',min:4,max:4,default:4},
 kitti:{name:'Kitti',min:2,max:5,default:3},
 faras:{name:'Faras',min:2,max:17,default:3},
 jutpatti:{name:'Jutpatti',min:2,max:6,default:3}
};
export function friendGame(id='marriage'){if(!Object.hasOwn(FRIEND_GAMES,id))throw Error('Choose a supported game.');return FRIEND_GAMES[id];}
export function friendPlayerCount(id,n){const game=friendGame(id);if(!Number.isInteger(n)||n<game.min||n>game.max)throw Error(id==='daharmara'?'Dahar Mara needs exactly four players.':`${game.name} supports ${game.min}–${game.max} players.`);return n;}
export function playerChoices(id){const g=friendGame(id);return Array.from({length:g.max-g.min+1},(_,i)=>{const n=g.min+i;return [n,String(n)+(id==='dhumbal'&&n>5?' · house variant':id==='callbreak'&&n===3?' · remove 2♥':'')];});}

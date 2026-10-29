import {NEPAL_MARRIAGE} from './core.js';
import {FRIEND_GAMES} from './friends-games.js';
export function playDefaults(type,saved={}){
 const common={players:FRIEND_GAMES[type]?.default??4};
 const defaults={marriage:{...NEPAL_MARRIAGE,scoringProfile:'nepal',coinsPerPoint:5,coinBudget:500},callbreak:{overtricks:true,coinsPerPoint:1,coinBudget:500},dhumbal:{limit:5,penalty:25,faceValues:'ten',runs:false,jackZero:false,coinsPerPoint:1,coinBudget:500},daharmara:{trump:'auto',teamCapture:false,boot:10},kitti:{aceLowBest:false,anyTwo:false,boot:10},faras:{turnCap:18,aceLowBest:true},jutpatti:{cards:5,wild:'auto',boot:10}}[type];
 if(!defaults)throw Error('Choose a supported game.');return structuredClone({...common,...defaults,...saved});
}

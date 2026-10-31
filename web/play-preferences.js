import {CALL_DEFAULTS} from './callbreak-match.js';
import {pointDefaults} from './point-rules.js';
import {NEPAL_MARRIAGE,BHOOS_MARRIAGE} from './core.js';
import {FRIEND_GAMES} from './friends-games.js';
export function customLegacyPreset(saved={}){return saved.scoringProfile==='bhoos'?structuredClone({...BHOOS_MARRIAGE,...saved,scoringProfile:'classic',pointRules:saved.pointRules??pointDefaults('bhoos')}):saved;}
export function playDefaults(type,saved={}){
 saved=customLegacyPreset(saved);const common={players:FRIEND_GAMES[type]?.default??4};
 const defaults={marriage:{...NEPAL_MARRIAGE,scoringProfile:'nepal',coinsPerPoint:5,coinBudget:500},callbreak:{...CALL_DEFAULTS},dhumbal:{limit:5,penalty:25,faceValues:'rank',runs:true,discardFirst:true,jackZero:false,coinsPerPoint:1,coinBudget:500},daharmara:{trump:'random',teamCapture:false,boot:10},kitti:{aceLowBest:false,anyTwo:false,boot:10,revealDirection:'clockwise'},faras:{turnCap:18,aceLowBest:true},jutpatti:{cards:5,wild:'auto',boot:10}}[type];
 if(type==='callbreak'){saved={...saved};if(saved.players!==undefined)saved.players=Math.min(4,Math.max(3,Number(saved.players)||4));delete saved.coinsPerPoint;delete saved.coinBudget;}
 if(!defaults)throw Error('Choose a supported game.');return structuredClone({...common,...defaults,...saved});
}

export const POINT_TABLES={tiplu:['Tiplu',2],poplu:['Poplu',3],jhiplu:['Jhiplu',3],alter:['Alter',3],putali:['Putali / Man',3],marriage:['Hand / mixed marriage',2],groundMarriage:['Ground marriage',2],normalTunnelas:['Ordinary tunnelas',3]};
export const POINT_SCALARS={master:'Master points',superman:'Superman points',jokerTunnela:'Joker tunnela',popluTunnela:'Poplu tunnela',jhipluTunnela:'Jhiplu tunnela',alterTunnela:'Alter tunnela',manTunnela:'Man / Putali tunnela',tripleBonus:'Extra bonus for three exposed tunnelas'};
const base={tiplu:[3,8],poplu:[2,5,10],jhiplu:[2,5,10],alter:[5,15,25],putali:[5,15,25],marriage:[10,30],groundMarriage:[15,35],normalTunnelas:[5,15,25],master:10,superman:5,jokerTunnela:10,popluTunnela:20,jhipluTunnela:20,alterTunnela:35,manTunnela:35,tripleBonus:0,tunnelaMode:'typed'};
export function pointDefaults(profile='nepal'){
 const values=profile==='bhoos'?{...base,marriage:[15,50],groundMarriage:[15,50],normalTunnelas:[5,10,15],tunnelaMode:'typed'}:profile==='classic'?{...base,tiplu:[3,7],alter:[5,10,15],putali:[5,10,15],groundMarriage:[10,30],normalTunnelas:[5,10,15],alterTunnela:10,manTunnela:45,tunnelaMode:'typed'}:base;
 return Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Array.isArray(v)?[...v]:v]));
}
export function validatePointRules(value,profile='nepal'){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Choose valid point values.');const out=pointDefaults(profile),number=n=>{if(!Number.isSafeInteger(n)||n<0||n>1000)throw Error('Point values must be whole numbers from 0 to 1000.');return n;};
 for(const [key,v] of Object.entries(value)){
  if(key==='tunnelaMode'){if(!['aggregate','typed'].includes(v))throw Error('Choose a valid tunnela rule.');out[key]=v;}
  else if(key==='enabled'){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid point toggle.');out.enabled={};for(const [name,on]of Object.entries(v)){if(!(POINT_TABLES[name]||POINT_SCALARS[name])||typeof on!=='boolean')throw Error('Invalid point toggle.');out.enabled[name]=on;}}
  else if(POINT_TABLES[key]){if(!Array.isArray(v)||v.length!==POINT_TABLES[key][1])throw Error('Complete every point value in the row.');out[key]=v.map(number);}
  else if(POINT_SCALARS[key])out[key]=number(v);else throw Error('Unknown point rule.');
 }
 return out;
}
export function effectivePointRules(options={}){if(options.pointRules)return validatePointRules(options.pointRules,options.scoringProfile||'classic');const rules=pointDefaults(options.scoringProfile||'classic');if(options.scoringProfile==='nepal')rules.tunnelaMode='aggregate';return rules;}

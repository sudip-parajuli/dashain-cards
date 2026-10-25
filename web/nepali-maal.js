import {effectivePointRules} from './point-rules.js';
export function nepaliMaal(cards,tip,tunnelas=[],openingGroups=[],options={scoringProfile:'nepal'}){
 const rules=effectivePointRules(options);for(const [key,on]of Object.entries(rules.enabled||{}))if(!on)rules[key]=Array.isArray(rules[key])?rules[key].map(()=>0):0;const held=[...new Map(cards.filter(Boolean).map(c=>[c.id,c])).values()],items=[];
 const add=(label,points,count)=>{if(points)items.push({label,points,count});};const value=(name,n)=>n?rules[name][n-1]??0:0;
 const used=new Set(),groups=[];
 for(const group of tunnelas){if(group.length!==3||!group.every(c=>c.r===group[0].r&&c.s===group[0].s)||group.some(c=>used.has(c.id))||!group.every(c=>held.some(h=>h.id===c.id)))continue;if(rules.tunnelaMode==='aggregate'&&group[0].r>=15)continue;groups.push(group);group.forEach(c=>used.add(c.id));}
 if(rules.tunnelaMode==='aggregate')add('Tunnelas',value('normalTunnelas',Math.min(groups.length,3)),groups.length);
 else {
  const counts={};for(const group of groups){const c=group[0],up=tip?.r===14?2:(tip?.r??0)+1,down=tip?.r===2?14:(tip?.r??0)-1,other=tip?{S:'C',C:'S',H:'D',D:'H'}[tip.s]:null;
   const key=c.r===15?'manTunnela':tip&&c.r===tip.r?(c.s===other&&options.alter!==false?'alterTunnela':'jokerTunnela'):tip&&c.s===tip.s&&c.r===up?'popluTunnela':tip&&c.s===tip.s&&c.r===down?'jhipluTunnela':'normalTunnelas';counts[key]=(counts[key]||0)+1;
  }
  for(const [key,n]of Object.entries(counts))add(key==='normalTunnelas'?'Tunnelas':({jokerTunnela:'Joker tunnela',popluTunnela:'Poplu tunnela',jhipluTunnela:'Jhiplu tunnela',alterTunnela:'Alter tunnela',manTunnela:'Man / Putali tunnela'})[key],key==='normalTunnelas'?value(key,Math.min(n,3)):rules[key]*n,n);
 }
 if(groups.length>=3)add('Custom triple-tunnela bonus',rules.tripleBonus,groups.length);
 const rest=held.filter(c=>!used.has(c.id)),putali=rest.filter(c=>c.r===15).length,master=rest.filter(c=>c.r===16).length,superman=rest.filter(c=>c.r===17).length;
 add('Putali / Man',value('putali',Math.min(putali,3)),putali);add('Master',master*rules.master,master);add('Superman',superman*rules.superman,superman);
 if(tip){
  const up=tip.r===14?2:tip.r+1,down=tip.r===2?14:tip.r-1,other={S:'C',C:'S',H:'D',D:'H'}[tip.s];
  const t=rest.filter(c=>c.s===tip.s&&c.r===tip.r).length,p=rest.filter(c=>c.s===tip.s&&c.r===up).length,j=rest.filter(c=>c.s===tip.s&&c.r===down).length,a=rest.filter(c=>c.s===other&&c.r===tip.r).length;
  if(options.alter!==false)add('Alter',value('alter',Math.min(a,3)),a);
  const ids=new Set(rest.map(c=>c.id)),ground=[];const grouped=new Set();
  for(const group of openingGroups){if(group.length!==3||group.some(c=>!ids.has(c.id)||grouped.has(c.id))||!group.every(c=>c.s===tip.s)||!group.some(c=>c.r===tip.r)||!group.some(c=>c.r===up)||!group.some(c=>c.r===down))continue;ground.push(group);group.forEach(c=>grouped.add(c.id));}
  let best={points:-1,parts:[]};
  // Enumerate all legal disjoint choices, including not using a marriage when a
  // custom table makes its individual cards worth more. Never sum both choices.
  for(let g=0;g<=Math.min(ground.length,2,t,p,j);g++)for(let m=0;m<=Math.min(2-g,t-g,p-g,j-g);m++){
   const parts=[{label:'Ground marriage',count:g,points:value('groundMarriage',g)},{label:'Marriage',count:m,points:value('marriage',m)},{label:'Tiplu',count:t-g-m,points:value('tiplu',t-g-m)},{label:'Poplu',count:p-g-m,points:value('poplu',p-g-m)},{label:'Jhiplu',count:j-g-m,points:value('jhiplu',j-g-m)}];
   const points=parts.reduce((n,x)=>n+x.points,0);if(points>best.points)best={points,parts};
  }
  items.push(...best.parts.filter(x=>x.points));
 }
 return {total:items.reduce((n,x)=>n+x.points,0),items};
}

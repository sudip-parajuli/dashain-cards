const CACHE='dashain-v68';const FILES=['./','index.html','startup.js','style.css','app.js','privacy-content.js','score-rules.js','realtime.js','audio.js','audio/the-auspicious-call.mp3','play-preferences.js','table.js','table.css','club.css','table-responsive.css','fonts/Baloo2.ttf','i18n.js','gestures.js','friends-games.js','online.js','score-links.js','room-service.js','core.js','court.js','court-detailed.js','hand-sort.js','games.js','marriage.js','marriage-ledger.js','marriage-breakdown.js','nepali-maal.js','game-economy.js','wallet.js','table-chips.js','point-rules.js','point-examples.js','faras-motion.js','table-motion.js','table-experience.js','table-experience.css','kitti-showdown.js','dahar.js','faras.js','icon.svg','manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dashain-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===self.location.origin)e.respondWith(caches.match(e.request).then(async hit=>hit||(e.request.mode==='navigate'&&new URL(e.request.url).pathname==='/dashaincards'?await caches.match(new URL('index.html',self.location.href).href):null)||fetch(e.request)));});











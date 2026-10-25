// Publisher configuration, never a player setting. Set once after HTTPS hosting is ready.
export const ROOM_SERVICE_URL='https://www.techwiredsolutions.com.np/dashaincards';
export function roomService(){

 // Integration tests/local development provide the endpoint before app startup.
 if(globalThis.DASHAIN_ROOM_SERVICE)return globalThis.DASHAIN_ROOM_SERVICE;
 if(ROOM_SERVICE_URL)return ROOM_SERVICE_URL;
 if(location.hostname==='appassets.androidplatform.net')return null;
 if(['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='4173')return location.origin.replace(':4173',':4174');
 return location.origin+(location.pathname.startsWith('/dashaincards/')||location.pathname==='/dashaincards'?'/dashaincards':'');
}




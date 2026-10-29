export async function readJSON(request,limit=8192){
 const declared=Number(request.headers.get('content-length')||0);if(!Number.isFinite(declared)||declared>limit)throw Error('Request is too large.');
 const reader=request.body?.getReader();let total=0,text='';const decoder=new TextDecoder();
 if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw Error('Request is too large.');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
 let value;try{value=JSON.parse(text||'{}');}catch{throw Error('Invalid JSON request.');}if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid request object.');return value;
}

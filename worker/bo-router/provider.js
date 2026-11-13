// Shared OpenAI provider for both FAQ steps. No file-based credentials or provider logs.
function strictSchema(schema) {
 const s=structuredClone(schema);
 if(s.type==='object') {
  const required=new Set(s.required||[]);
  s.properties=Object.fromEntries(Object.entries(s.properties||{}).map(([k,v])=>[k,required.has(k)?strictSchema(v):{anyOf:[strictSchema(v),{type:'null'}]}]));
  s.required=Object.keys(s.properties);s.additionalProperties=false;
 }
 if(s.items)s.items=strictSchema(s.items);
 return s;
}
export function buildOpenAIRequest(env,req) {
 return {model:env.OPENAI_MODEL||'gpt-4o-mini',temperature:req.temperature??0,max_completion_tokens:Math.max(16,req.maxOutputTokens),
 messages:[{role:'system',content:req.system},{role:'user',content:req.user}],
 response_format:{type:'json_schema',json_schema:{name:'bo_faq',strict:true,schema:strictSchema(req.schema)}}};
}
export async function generate(env,req) {
 const base=String(env.OPENAI_BASE_URL||'https://api.openai.com').replace(/\/+$/,'');
 if(base!=='https://api.openai.com'&&!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base))return {ok:false,status:503};
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),Math.max(1,req.timeoutMs||5000));
 try {
  const res=await fetch(base+'/v1/chat/completions',{method:'POST',signal:ctrl.signal,headers:{'content-type':'application/json',authorization:'Bearer '+env.OPENAI_API_KEY},body:JSON.stringify(buildOpenAIRequest(env,req))});
  if(!res.ok){try{await res.body?.cancel();}catch{}return {ok:false,status:res.status===429?503:502};}
  const data=await res.json(),c=data?.choices?.[0];
  if(c?.finish_reason!=='stop'||c.message?.refusal||typeof c.message?.content!=='string'||!c.message.content.trim())return {ok:false,status:502};
  const u=data.usage,r=u?.completion_tokens_details?.reasoning_tokens||0;
  return {ok:true,text:c.message.content,usage:u?[u.prompt_tokens|0,(u.completion_tokens|0)-r,r]:null};
 }catch(e){return {ok:false,status:e?.name==='AbortError'?504:502};}finally{clearTimeout(timer);}
}

export const providerIdentity = env => 'openai:' + (env.OPENAI_MODEL || 'gpt-4o-mini');

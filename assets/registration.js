(function(root){
 'use strict';
 var MAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 function fault(code){var e=new Error(code);e.code=code;return e;}
 function validate(data){
  var p={name:String(data.ten||'').trim(),phone:String(data.sdt||'').trim().replace(/[\s()+.\-\u2010-\u2015]/g,''),email:String(data.email||'').trim(),workshop:'F2',preferredContact:'zalo',message:'',website:String(data.website||'').trim()};
  if(!p.name||p.name.length>100||!/^\d{9,11}$/.test(p.phone)||p.email.length>254||p.email&&!MAIL.test(p.email))throw fault('invalid-fields');
  return p;
 }
 function create(fetcher){
  var configPromise;
  function config(){if(!configPromise)configPromise=fetcher('assets/content/registration.json',{cache:'no-store',credentials:'omit'}).then(function(r){if(!r.ok)throw fault('not-configured');return r.json();}).then(function(c){if(!c||typeof c.endpoint!=='string'||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(c.endpoint)||typeof c.fallbackEmail!=='string'||!MAIL.test(c.fallbackEmail))throw fault('not-configured');return c;}).catch(function(){configPromise=null;throw fault('not-configured');});return configPromise;}
  return {submit:function(data){var payload;try{payload=validate(data);}catch(e){return Promise.reject(e);}return config().then(function(c){return fetcher(c.endpoint,{method:'POST',mode:'no-cors',credentials:'omit',redirect:'follow',referrerPolicy:'no-referrer',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(function(){return {ok:true,sent:true};},function(){var e=fault('network');e.fallbackEmail=c.fallbackEmail;throw e;});});}};
 }
 root.MemoriRegistration={create:create,validate:validate};
})(typeof window!=='undefined'?window:globalThis);

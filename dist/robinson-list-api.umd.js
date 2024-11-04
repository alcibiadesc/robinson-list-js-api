(function(i,h){typeof exports=="object"&&typeof module<"u"?h(exports,require("node-fetch"),require("crypto-browserify")):typeof define=="function"&&define.amd?define(["exports","node-fetch","crypto-browserify"],h):(i=typeof globalThis<"u"?globalThis:i||self,h(i.RobinsonListAPI={},i.fetch,i.crypto))})(this,function(i,h,r){"use strict";const f={PhoneSimple:{id:"04",fields:["phone"],types:["phone"],fileType:"Phones",campaign:"Calls"},SmsSimple:{id:"03",fields:["phone"],types:["phone"],fileType:"Phones",campaign:"Sms"},PhoneFull:{id:"04",fields:["name","surname1","surname2","phone"],types:["text","text","text","phone"],fileType:"NameAndPhones",campaign:"Calls"},SmsFull:{id:"03",fields:["name","surname1","surname2","phone"],types:["text","text","text","phone"],fileType:"NameAndPhones",campaign:"Sms"},Postal:{id:"01",fields:["name","surname1","surname2","street","portal","zip","province"],types:["text","text","text","text","portal","preserve","preserve"],fileType:"Postal",campaign:"Postal"},Email:{id:"02",fields:["email"],types:["email"],fileType:"Email",campaign:"Email"},DNI_NIF_NIE:{id:"00",fields:["dni"],types:["identity"],fileType:"DNI_NIF_NIE",campaign:"DNI_NIF_NIE"}},H="Mixed",S="0034",z="ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÇÈÉÌÍÑÒÓÙÚÜàáçèéìíñòóùúü".split(""),T="abcdefghijklmnopqrstuvwxyzaaceeiinoouuuaaceeiinoouuu".split(""),R="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),P="abcdefghijklmnopqrstuvwxyz".split(""),b=/[^a-z]/g,N=/[^a-z0-9.@_\-+]/g,D=/[^0-9]/g,I=/[0-9]*/,A="0123456789ABCDEFGHJKLMNPQRSTVWXYZ".split(""),E="0123456789abcdefghjklmnpqrstvwxyz".split(""),q=/[^0-9abcdefghjklmnpqrstvwxyz]/g,g=(e,t,s)=>s.split("").map(n=>{const a=e.indexOf(n);return a!==-1?t[a]:n}).join(""),C={phone:e=>{const t=e.replace(D,"");return e.startsWith("+")?"00"+t:e.startsWith("00")?t:S+t},text:e=>g(z,T,e).replace(b,""),email:e=>g(R,P,e).replace(N,""),portal:e=>e==="sn"?"sn":e.match(I).toString(),identity:e=>g(A,E,e).replace(q,""),preserve:e=>e},F=(e,t)=>{const s=[...e],n=t===H?s.shift():t;if(!f.hasOwnProperty(n))return console.warn(`Unknown channel type "${n}" for record:`,e),null;const a=f[n].fields.length;return s.length!==a?(console.warn("Malformed record:",e),null):{channel:n,fields:s}},v=e=>{try{const{channel:t,fields:s}=e,{id:n,types:a}=f[t],o=s.map((c,d)=>C[a[d]](c)).join("");(o.length===0||o===S)&&console.warn(`Warning: empty record after normalization. Original: "${s}". Normalized for channel ${t}: "${o}".`);const l=n+o;return r.createHash("sha256").update(l).digest("hex")}catch(t){return console.error("Error generating hash:",t),null}};function j(e,t,s,n){const a=r.createHmac("sha256",`AWS4${e}`).update(t).digest(),o=r.createHmac("sha256",a).update(s).digest(),l=r.createHmac("sha256",o).update(n).digest();return r.createHmac("sha256",l).update("aws4_request").digest()}function k(e,t,s,n,a,o){const c=new Date().toISOString().replace(/[-:]/g,"").substring(0,15)+"Z",d=c.substring(0,8),u=new URL(o).pathname,y=new URL(o).host,x="POST",p=`host:${y}
`,m="host",O=r.createHash("sha256").update(a).digest("hex"),_=`${x}
${u}

${p}
${m}
${O}`,$="AWS4-HMAC-SHA256",w=`${d}/${s}/${n}/aws4_request`,W=`${$}
${c}
${w}
${r.createHash("sha256").update(_).digest("hex")}`,M=j(t,d,s,n),U=r.createHmac("sha256",M).update(W).digest("hex");return{authorizationHeader:`${$} Credential=${e}/${w}, SignedHeaders=${m}, Signature=${U}`,amzDate:c}}async function L({accessKey:e,secretKey:t,region:s,service:n,endpoint:a,channel:o,data:l}){const c=F(l,o);if(!c)throw new Error("Invalid record");const d=v(c);if(!d)throw new Error("Failed to generate hash");const u=d,{authorizationHeader:y,amzDate:x}=k(e,t,s,n,u,a),p=await h(a,{method:"POST",headers:{"Content-Type":"text/plain",Authorization:y,"X-Amz-Date":x},body:u});if(!p.ok){const m=await p.text();throw new Error(`HTTP error! status: ${p.status}, body: ${m}`)}return p.json()}i.sendListaRobinsonRequest=L,Object.defineProperty(i,Symbol.toStringTag,{value:"Module"})});
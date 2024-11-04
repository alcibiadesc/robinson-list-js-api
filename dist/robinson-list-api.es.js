import P from "node-fetch";
import i from "crypto-browserify";
const f = {
  PhoneSimple: {
    id: "04",
    fields: ["phone"],
    types: ["phone"],
    fileType: "Phones",
    campaign: "Calls"
  },
  SmsSimple: {
    id: "03",
    fields: ["phone"],
    types: ["phone"],
    fileType: "Phones",
    campaign: "Sms"
  },
  PhoneFull: {
    id: "04",
    fields: ["name", "surname1", "surname2", "phone"],
    types: ["text", "text", "text", "phone"],
    fileType: "NameAndPhones",
    campaign: "Calls"
  },
  SmsFull: {
    id: "03",
    fields: ["name", "surname1", "surname2", "phone"],
    types: ["text", "text", "text", "phone"],
    fileType: "NameAndPhones",
    campaign: "Sms"
  },
  Postal: {
    id: "01",
    fields: [
      "name",
      "surname1",
      "surname2",
      "street",
      "portal",
      "zip",
      "province"
    ],
    types: ["text", "text", "text", "text", "portal", "preserve", "preserve"],
    fileType: "Postal",
    campaign: "Postal"
  },
  Email: {
    id: "02",
    fields: ["email"],
    types: ["email"],
    fileType: "Email",
    campaign: "Email"
  },
  DNI_NIF_NIE: {
    id: "00",
    fields: ["dni"],
    types: ["identity"],
    fileType: "DNI_NIF_NIE",
    campaign: "DNI_NIF_NIE"
  }
}, R = "Mixed", S = "0034", N = "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÇÈÉÌÍÑÒÓÙÚÜàáçèéìíñòóùúü".split(
  ""
), D = "abcdefghijklmnopqrstuvwxyzaaceeiinoouuuaaceeiinoouuu".split(
  ""
), E = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), I = "abcdefghijklmnopqrstuvwxyz".split(""), A = /[^a-z]/g, C = /[^a-z0-9.@_\-+]/g, F = /[^0-9]/g, b = /[0-9]*/, k = "0123456789ABCDEFGHJKLMNPQRSTVWXYZ".split(""), q = "0123456789abcdefghjklmnpqrstvwxyz".split(""), v = /[^0-9abcdefghjklmnpqrstvwxyz]/g, g = (e, t, a) => a.split("").map((n) => {
  const s = e.indexOf(n);
  return s !== -1 ? t[s] : n;
}).join(""), _ = {
  phone: (e) => {
    const t = e.replace(F, "");
    return e.startsWith("+") ? "00" + t : e.startsWith("00") ? t : S + t;
  },
  text: (e) => g(N, D, e).replace(A, ""),
  email: (e) => g(E, I, e).replace(C, ""),
  portal: (e) => e === "sn" ? "sn" : e.match(b).toString(),
  identity: (e) => g(k, q, e).replace(v, ""),
  preserve: (e) => e
}, O = (e, t) => {
  const a = [...e], n = t === R ? a.shift() : t;
  if (!f.hasOwnProperty(n))
    return console.warn(`Unknown channel type "${n}" for record:`, e), null;
  const s = f[n].fields.length;
  return a.length !== s ? (console.warn("Malformed record:", e), null) : { channel: n, fields: a };
}, W = (e) => {
  try {
    const { channel: t, fields: a } = e, { id: n, types: s } = f[t], o = a.map((r, c) => _[s[c]](r)).join("");
    (o.length === 0 || o === S) && console.warn(
      `Warning: empty record after normalization. Original: "${a}". Normalized for channel ${t}: "${o}".`
    );
    const l = n + o;
    return i.createHash("sha256").update(l).digest("hex");
  } catch (t) {
    return console.error("Error generating hash:", t), null;
  }
};
function j(e, t, a, n) {
  const s = i.createHmac("sha256", `AWS4${e}`).update(t).digest(), o = i.createHmac("sha256", s).update(a).digest(), l = i.createHmac("sha256", o).update(n).digest();
  return i.createHmac("sha256", l).update("aws4_request").digest();
}
function L(e, t, a, n, s, o) {
  const r = (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").substring(0, 15) + "Z", c = r.substring(0, 8), d = new URL(o).pathname, m = new URL(o).host, u = "POST", p = `host:${m}
`, h = "host", $ = i.createHash("sha256").update(s).digest("hex"), H = `${u}
${d}

${p}
${h}
${$}`, y = "AWS4-HMAC-SHA256", x = `${c}/${a}/${n}/aws4_request`, w = `${y}
${r}
${x}
${i.createHash("sha256").update(H).digest("hex")}`, z = j(t, c, a, n), T = i.createHmac("sha256", z).update(w).digest("hex");
  return { authorizationHeader: `${y} Credential=${e}/${x}, SignedHeaders=${h}, Signature=${T}`, amzDate: r };
}
async function X({
  accessKey: e,
  secretKey: t,
  region: a,
  service: n,
  endpoint: s,
  channel: o,
  data: l
  // array of field values
}) {
  const r = O(l, o);
  if (!r)
    throw new Error("Invalid record");
  const c = W(r);
  if (!c)
    throw new Error("Failed to generate hash");
  const d = c, { authorizationHeader: m, amzDate: u } = L(
    e,
    t,
    a,
    n,
    d,
    s
  ), p = await P(s, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: m,
      "X-Amz-Date": u
    },
    body: d
  });
  if (!p.ok) {
    const h = await p.text();
    throw new Error(
      `HTTP error! status: ${p.status}, body: ${h}`
    );
  }
  return p.json();
}
export {
  X as sendListaRobinsonRequest
};

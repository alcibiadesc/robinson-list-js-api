import crypto from "crypto-browserify";
const channels = {
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
};
const mixedRecord = "Mixed";
const defaultCountryCode = "0034";
const textSrc = "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÇÈÉÌÍÑÒÓÙÚÜàáçèéìíñòóùúü".split(
  ""
);
const textDst = "abcdefghijklmnopqrstuvwxyzaaceeiinoouuuaaceeiinoouuu".split(
  ""
);
const emailSrc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const emailDst = "abcdefghijklmnopqrstuvwxyz".split("");
const textRegexp = /[^a-z]/g;
const emailRegexp = /[^a-z0-9.@_\-+]/g;
const numberRegexp = /[^0-9]/g;
const portalRegexp = /[0-9]*/;
const identitySrc = "0123456789ABCDEFGHJKLMNPQRSTVWXYZ".split("");
const identityDst = "0123456789abcdefghjklmnpqrstvwxyz".split("");
const identityRegex = /[^0-9abcdefghjklmnpqrstvwxyz]/g;
const translate = (src, dst, value) => value.split("").map((c) => {
  const idx = src.indexOf(c);
  return idx !== -1 ? dst[idx] : c;
}).join("");
const normalizers = {
  phone: (n) => {
    const normalized = n.replace(numberRegexp, "");
    if (n.startsWith("+")) return "00" + normalized;
    if (n.startsWith("00")) return normalized;
    return defaultCountryCode + normalized;
  },
  text: (n) => translate(textSrc, textDst, n).replace(textRegexp, ""),
  email: (n) => translate(emailSrc, emailDst, n).replace(emailRegexp, ""),
  portal: (n) => n === "sn" ? "sn" : n.match(portalRegexp).toString(),
  identity: (n) => translate(identitySrc, identityDst, n).replace(identityRegex, ""),
  preserve: (n) => n
};
const sanitize = (fields, channel) => {
  const sanFields = [...fields];
  const sanChannel = channel === mixedRecord ? sanFields.shift() : channel;
  if (!channels.hasOwnProperty(sanChannel)) {
    console.warn(`Unknown channel type "${sanChannel}" for record:`, fields);
    return null;
  }
  const expectedFieldsLength = channels[sanChannel].fields.length;
  if (sanFields.length !== expectedFieldsLength) {
    console.warn("Malformed record:", fields);
    return null;
  }
  return { channel: sanChannel, fields: sanFields };
};
const recordToHash = (recordValues) => {
  try {
    const { channel, fields } = recordValues;
    const { id, types } = channels[channel];
    const filtered = fields.map((val, i) => normalizers[types[i]](val)).join("");
    if (filtered.length === 0 || filtered === defaultCountryCode) {
      console.warn(
        `Warning: empty record after normalization. Original: "${fields}". Normalized for channel ${channel}: "${filtered}".`
      );
    }
    const query = id + filtered;
    return crypto.createHash("sha256").update(query).digest("hex");
  } catch (error) {
    console.error("Error generating hash:", error);
    return null;
  }
};
function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = crypto.createHmac("sha256", `AWS4${key}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(regionName).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
  return crypto.createHmac("sha256", kService).update("aws4_request").digest();
}
function createAuthorizationHeader(accessKey, secretKey, region, service, payload, endpoint) {
  const t = /* @__PURE__ */ new Date();
  const amzDate = t.toISOString().replace(/[-:]/g, "").substring(0, 15) + "Z";
  const dateStamp = amzDate.substring(0, 8);
  const canonicalUri = new URL(endpoint).pathname;
  const host = new URL(endpoint).host;
  const method = "POST";
  const canonicalHeaders = `host:${host}
`;
  const signedHeaders = "host";
  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");
  const canonicalRequest = `${method}
${canonicalUri}

${canonicalHeaders}
${signedHeaders}
${payloadHash}`;
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}
${amzDate}
${credentialScope}
${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;
  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return { authorizationHeader, amzDate };
}
let fetchFunction;
async function initializeFetch() {
  if (typeof window === "undefined") {
    const { default: nodeFetch } = await import("node-fetch");
    fetchFunction = nodeFetch;
  } else {
    fetchFunction = fetch;
  }
}
async function sendListaRobinsonRequest({
  accessKey,
  secretKey,
  region,
  service,
  endpoint,
  channel,
  data
  // array of field values
}) {
  if (!fetchFunction) {
    await initializeFetch();
  }
  const sanitizedRecord = sanitize(data, channel);
  if (!sanitizedRecord) {
    throw new Error("Invalid record");
  }
  const hash = recordToHash(sanitizedRecord);
  if (!hash) {
    throw new Error("Failed to generate hash");
  }
  const payload = hash;
  const { authorizationHeader, amzDate } = createAuthorizationHeader(
    accessKey,
    secretKey,
    region,
    service,
    payload,
    endpoint
  );
  const response = await fetchFunction(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: authorizationHeader,
      "X-Amz-Date": amzDate
    },
    body: payload
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorText}`
    );
  }
  return response.json();
}
export {
  sendListaRobinsonRequest
};

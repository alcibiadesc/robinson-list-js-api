// Conditionally import crypto or crypto-browserify based on environment
let crypto;

async function loadCrypto() {
  if (typeof window !== "undefined" && window.crypto) {
    // Browser environment: use crypto-browserify
    crypto = await import("crypto-browserify");
  } else {
    // Node.js environment: use native crypto
    crypto = await import("crypto");
  }
}

// Call loadCrypto to initialize crypto before using it
await loadCrypto();

/**
 * Generates the signing key using AWS4-HMAC-SHA256.
 */
function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = crypto
    .createHmac("sha256", `AWS4${key}`)
    .update(dateStamp)
    .digest();
  const kRegion = crypto
    .createHmac("sha256", kDate)
    .update(regionName)
    .digest();
  const kService = crypto
    .createHmac("sha256", kRegion)
    .update(serviceName)
    .digest();
  return crypto.createHmac("sha256", kService).update("aws4_request").digest();
}

/**
 * Generates the authorization header for the Lista Robinson API.
 */
export function createAuthorizationHeader(
  accessKey,
  secretKey,
  region,
  service,
  payload,
  endpoint
) {
  const t = new Date();
  const amzDate = t.toISOString().replace(/[-:]/g, "").substring(0, 15) + "Z";
  const dateStamp = amzDate.substring(0, 8);

  const canonicalUri = new URL(endpoint).pathname;
  const host = new URL(endpoint).host;

  // Create the Canonical Request
  const method = "POST";
  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");
  const canonicalRequest = `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create the String-to-Sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
    .createHash("sha256")
    .update(canonicalRequest)
    .digest("hex")}`;

  // Calculate the signature
  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  // Create the Authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authorizationHeader, amzDate };
}

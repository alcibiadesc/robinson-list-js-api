import fetch from "node-fetch";
import { recordToHash, sanitize } from "./utils.js";
import { createAuthorizationHeader } from "./awsSignature.js";

/**
 * Makes a request to the Lista Robinson API with the AWS signature.
 */
export async function sendListaRobinsonRequest({
  accessKey,
  secretKey,
  region,
  service,
  endpoint,
  channel,
  data, // array of field values
}) {
  // Sanitize the input fields
  const sanitizedRecord = sanitize(data, channel);
  if (!sanitizedRecord) {
    throw new Error("Invalid record");
  }

  // Generate the hash
  const hash = recordToHash(sanitizedRecord);
  if (!hash) {
    throw new Error("Failed to generate hash");
  }

  // The payload is the hash
  const payload = hash;

  const { authorizationHeader, amzDate } = createAuthorizationHeader(
    accessKey,
    secretKey,
    region,
    service,
    payload,
    endpoint
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: authorizationHeader,
      "X-Amz-Date": amzDate,
    },
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorText}`
    );
  }

  return response.json();
}

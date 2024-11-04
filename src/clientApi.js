import { recordToHash, sanitize } from "./utils.js";
import { createAuthorizationHeader } from "./awsSignature.js";

let fetchFunction;

// Función de inicialización para configurar `fetch` en el entorno adecuado
async function initializeFetch() {
  if (typeof window === "undefined") {
    // Importa `node-fetch` solo en entornos de servidor (Node.js)
    const { default: nodeFetch } = await import("node-fetch");
    fetchFunction = nodeFetch;
  } else {
    // Usa `fetch` nativo en el navegador
    fetchFunction = fetch;
  }
}

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
  // Inicializa `fetchFunction` si no está configurado
  if (!fetchFunction) {
    await initializeFetch();
  }

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

  const response = await fetchFunction(endpoint, {
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

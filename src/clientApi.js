// clientApi.js

import { recordToHash, sanitize } from "./utils.js";
import { createAuthorizationHeader } from "./awsSignature.js";

let fetchFunction;

// Detecta si fetch está disponible (en navegadores y Node.js 18+)
if (typeof fetch === "function") {
  fetchFunction = fetch;
} else {
  // En versiones anteriores de Node.js
  import("node-fetch").then((module) => {
    fetchFunction = module.default;
  });
}

/**
 * Realiza una solicitud a la API de Lista Robinson con la firma AWS.
 */
export async function sendListaRobinsonRequest({
  accessKey,
  secretKey,
  region,
  service,
  endpoint,
  channel,
  data, // array de valores de campos
}) {
  // Asegura que fetchFunction esté inicializado
  if (!fetchFunction) {
    if (typeof fetch === "function") {
      fetchFunction = fetch;
    } else {
      const { default: nodeFetch } = await import("node-fetch");
      fetchFunction = nodeFetch;
    }
  }

  // Sanitiza los campos de entrada
  const sanitizedRecord = sanitize(data, channel);
  if (!sanitizedRecord) {
    throw new Error("Registro inválido");
  }

  // Genera el hash
  const hash = recordToHash(sanitizedRecord);
  if (!hash) {
    throw new Error("Fallo al generar el hash");
  }

  // El payload es el hash
  const payload = hash;

  // Crea los encabezados de autorización
  const { authorizationHeader, amzDate } = createAuthorizationHeader(
    accessKey,
    secretKey,
    region,
    service,
    payload,
    endpoint
  );

  // Realiza la solicitud HTTP
  const response = await fetchFunction(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: authorizationHeader,
      "X-Amz-Date": amzDate,
    },
    body: payload,
  });

  // Manejo de errores HTTP
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error HTTP! estado: ${response.status}, cuerpo: ${errorText}`
    );
  }

  // Devuelve la respuesta en formato JSON
  return response.json();
}

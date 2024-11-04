// clientApi.js

import { recordToHash, sanitize } from "./utils.js";
import { createAuthorizationHeader } from "./awsSignature.js";

let fetchFunction;

function initializeFetchFunction() {
  if (fetchFunction) {
    return; // Ya está inicializado
  }

  if (typeof fetch === "function") {
    // En navegadores y Node.js 18+
    fetchFunction = fetch.bind(globalThis);
  } else if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    // En Node.js (excluye entornos de navegador)
    try {
      // Utiliza require para evitar problemas en el bundling del navegador
      const nodeFetch = require("node-fetch");
      fetchFunction = nodeFetch;
    } catch (error) {
      throw new Error(
        "Necesitas instalar 'node-fetch' en entornos de Node.js anteriores a la versión 18."
      );
    }
  } else {
    throw new Error("Fetch API no está disponible en este entorno.");
  }
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
  initializeFetchFunction();

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

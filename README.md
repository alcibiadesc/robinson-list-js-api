# Lista Robinson API - Biblioteca Cliente en JavaScript

Esta biblioteca de JavaScript simplifica la realización de solicitudes autenticadas a la API de Lista Robinson utilizando la Firma AWS Versión 4. Maneja las complejidades de generar los encabezados de autenticación necesarios, firmar solicitudes, normalizar datos de entrada y generar los hashes requeridos, lo que permite a los desarrolladores integrar fácilmente con el servicio de Lista Robinson.

## Tabla de Contenidos

- [Lista Robinson API - Biblioteca Cliente en JavaScript](#lista-robinson-api---biblioteca-cliente-en-javascript)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [¿Qué hace la api?](#qué-hace-la-api)
  - [Instalación](#instalación)
  - [Configuración](#configuración)
  - [Uso](#uso)
    - [Ejemplo de Uso](#ejemplo-de-uso)
    - [Canales Disponibles y Campos Requeridos](#canales-disponibles-y-campos-requeridos)
    - [Tipos de Campos y Normalización](#tipos-de-campos-y-normalización)
  - [Pruebas desde la Terminal](#pruebas-desde-la-terminal)

## ¿Qué hace la api?

- **Soporte para Todos los Canales**: Integra con todos los canales disponibles proporcionados por el client-server de Lista Robinson.
- **Normalización Automática de Datos**: Normaliza los datos de entrada según las reglas del servicio antes de generar el hash.
- **Generación de Hash**: Genera los hashes SHA-256 requeridos.
- **Autenticación AWS Firma Versión 4**: Maneja la firma de solicitudes conforme a AWS Signature Version 4 utiliznado cripto.js.

## Instalación

1. **Clona el repositorio** y navega al directorio del proyecto:

   ```bash
   git clone https://github.com/CampusTraining/api-library-robinson-js.git
   cd api-lista-robinson-js
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

## Configuración

1. **Crea un archivo `.env`** en el directorio raíz de tu proyecto:

   ```dotenv
   ACCESS_KEY=TU_ACCESS_KEY
   SECRET_KEY=TU_SECRET_KEY
   ```

   Reemplaza `TU_ACCESS_KEY` y `TU_SECRET_KEY` con tus credenciales reales de AWS.

## Uso

Aquí tienes un ejemplo de cómo utilizar la función principal `sendListaRobinsonRequest` para realizar una solicitud a la API.

### Ejemplo de Uso

```javascript
// example.js

import { config } from "dotenv";
import { sendListaRobinsonRequest } from "./apiClient.js";

// Carga las variables de entorno
config();

// Recupera las credenciales y configuración desde las variables de entorno
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;
const region = "eu-west-1";
const service = "execute-api";
const endpoint = "https://api.listarobinson.es/v1/api/user";

// Datos para la solicitud
const channel = "PhoneSimple"; // Uno de los canales disponibles
const data = ["636238940"]; // Campos correspondientes al canal

(async () => {
  try {
    const response = await sendListaRobinsonRequest({
      accessKey,
      secretKey,
      region,
      service,
      endpoint,
      channel,
      data,
    });
    console.log("Respuesta de la API:", response);
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

**Ejecutando el Ejemplo:**

```bash
npm run example
```

### Canales Disponibles y Campos Requeridos

Los siguientes canales (channels) son soportados, junto con los campos requeridos:

- **DNI_NIF_NIE**

  - **ID**: `00`
  - **Campos**: `dni`
  - **Tipos de Campos**: `identity`
  - **Datos de Ejemplo**: `['78493085L']`

- **Email**

  - **ID**: `02`
  - **Campos**: `email`
  - **Tipos de Campos**: `email`
  - **Datos de Ejemplo**: `['example@example.com']`

- **PhoneSimple**

  - **ID**: `04`
  - **Campos**: `phone`
  - **Tipos de Campos**: `phone`
  - **Datos de Ejemplo**: `['636238940']`

- **SmsSimple**

  - **ID**: `03`
  - **Campos**: `phone`
  - **Tipos de Campos**: `phone`
  - **Datos de Ejemplo**: `['636238940']`

- **PhoneFull**

  - **ID**: `04`
  - **Campos**: `name`, `surname1`, `surname2`, `phone`
  - **Tipos de Campos**: `text`, `text`, `text`, `phone`
  - **Datos de Ejemplo**: `['John', 'Doe', '', '636238940']`

- **SmsFull**

  - **ID**: `03`
  - **Campos**: `name`, `surname1`, `surname2`, `phone`
  - **Tipos de Campos**: `text`, `text`, `text`, `phone`
  - **Datos de Ejemplo**: `['John', 'Doe', '', '636238940']`

- **Postal**
  - **ID**: `01`
  - **Campos**: `name`, `surname1`, `surname2`, `street`, `portal`, `zip`, `province`
  - **Tipos de Campos**: `text`, `text`, `text`, `text`, `portal`, `preserve`, `preserve`
  - **Datos de Ejemplo**: `['John', 'Doe', '', 'Main St', '123', '28080', 'Madrid']`

### Tipos de Campos y Normalización

Cada tipo de campo se normaliza según reglas específicas antes de generar el hash:

- **phone**:

  - Elimina caracteres no numéricos.
  - Añade código de país si falta (por defecto España, `0034`).
  - Si el número de teléfono comienza con `+`, se reemplaza por `00`.

- **text**:

  - Convierte a minúsculas.
  - Elimina acentos y caracteres especiales.
  - Elimina cualquier carácter no alfabético.

- **email**:

  - Convierte a minúsculas.
  - Elimina caracteres inválidos.
  - Mantiene caracteres estándar de email.

- **identity**:

  - Convierte letras a minúsculas.
  - Elimina caracteres inválidos.
  - Mantiene números y letras específicas en minúsculas.

- **portal**:

  - Extrae la parte numérica.
  - Manejo especial para 'sn' (sin número).

- **preserve**:
  - No se aplica normalización.

## Pruebas desde la Terminal

1. **Añade tus credenciales de API** en el archivo `.env` como se muestra en la sección de configuración.

2. **Utiliza el archivo `example.js`** para probar la biblioteca con diferentes canales y datos.

3. **Ejecuta el script de prueba** desde la terminal:

   ```bash
   npm run example
   ```

# Lista Robinson API - JavaScript Client Library

This JavaScript library simplifies making authenticated requests to the Lista Robinson API using AWS Signature Version 4. It handles the complexities of generating the necessary authentication headers, signing requests, normalizing input data, and generating the required hashes, allowing developers to easily integrate with the Lista Robinson service.

## Compatibility Notice

⚠️ **This library currently supports only Node.js environments** and may not work in browsers due to CORS restrictions imposed by the Lista Robinson API, which blocks requests from browser origins. If you're interested in helping us expand support to browser environments, contributions are welcome! Feel free to check out the repository and submit a pull request.

## Table of Contents

- [Lista Robinson API - JavaScript Client Library](#lista-robinson-api---javascript-client-library)
  - [Compatibility Notice](#compatibility-notice)
  - [Table of Contents](#table-of-contents)
  - [What Does the API Do?](#what-does-the-api-do)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
    - [Usage Example](#usage-example)
    - [Available Channels and Required Fields](#available-channels-and-required-fields)
    - [Field Types and Normalization](#field-types-and-normalization)
  - [Testing from the Terminal](#testing-from-the-terminal)

## What Does the API Do?

- **Support for All Channels**: Integrates with all available channels provided by the Lista Robinson client-server.
- **Automatic Data Normalization**: Normalizes input data according to the service rules before generating the hash.
- **Hash Generation**: Generates the required SHA-256 hashes.
- **AWS Signature Version 4 Authentication**: Handles request signing according to AWS Signature Version 4 using crypto.js.

## Installation

```bash
npm i robinson-list-js-api
```

## Configuration

1. **Create a `.env` file** in the root directory of your project:

   ```dotenv
   ACCESS_KEY=YOUR_ACCESS_KEY
   SECRET_KEY=YOUR_SECRET_KEY
   ```

   Replace `YOUR_ACCESS_KEY` and `YOUR_SECRET_KEY` with your actual AWS credentials.

In this example we use [dotenv](https://www.npmjs.com/package/dotenv) to loads environment variables from a .env file into process.env

If you want to use the same library

```bash
npm install dotenv --save
```

## Usage

Here is an example of how to use the main function `sendListaRobinsonRequest` to make a request to the API.

### Usage Example

```javascript
import { config } from "dotenv";
import { sendListaRobinsonRequest } from "robinson-list-js-api";

// Load .env variables
config();

const accessKey = process.env.ACCESS_KEY || "";
const secretKey = process.env.SECRET_KEY || "";
const region = "eu-west-1";
const service = "execute-api";
const endpoint = "https://api.listarobinson.es/v1/api/user";

// x3 Example Data
const testData = [
  {
    channel: "DNI_NIF_NIE",
    data: ["12345678Z"],
  },
  {
    channel: "PhoneSimple",
    data: ["612345678"],
  },
  {
    channel: "Email",
    data: ["ejemplo.prueba@example.com"],
  },
];

(async () => {
  try {
    for (const test of testData) {
      const response = await sendListaRobinsonRequest({
        accessKey,
        secretKey,
        region,
        service,
        endpoint,
        channel: test.channel,
        data: test.data,
      });
      console.log(`API Response for channel ${test.channel}:`, response);
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

**Note**: It is recommended to use environment variables to store sensitive information such as access keys, secret keys, and endpoint URLs. This ensures that sensitive data is not hardcoded in your source code, reducing security risks and allowing better flexibility across different environments (development, staging, production).

**Running the Example:**

```bash
npm run example
```

### Available Channels and Required Fields

The following channels are supported, along with their required fields:

- **DNI_NIF_NIE**

  - **ID**: `00`
  - **Fields**: `dni`
  - **Field Types**: `identity`
  - **Example Data**: `['78493085L']`

- **Email**

  - **ID**: `02`
  - **Fields**: `email`
  - **Field Types**: `email`
  - **Example Data**: `['example@example.com']`

- **PhoneSimple**

  - **ID**: `04`
  - **Fields**: `phone`
  - **Field Types**: `phone`
  - **Example Data**: `['636238940']`

- **SmsSimple**

  - **ID**: `03`
  - **Fields**: `phone`
  - **Field Types**: `phone`
  - **Example Data**: `['636238940']`

- **PhoneFull**

  - **ID**: `04`
  - **Fields**: `name`, `surname1`, `surname2`, `phone`
  - **Field Types**: `text`, `text`, `text`, `phone`
  - **Example Data**: `['John', 'Doe', '', '636238940']`

- **SmsFull**

  - **ID**: `03`
  - **Fields**: `name`, `surname1`, `surname2`, `phone`
  - **Field Types**: `text`, `text`, `text`, `phone`
  - **Example Data**: `['John', 'Doe', '', '636238940']`

- **Postal**
  - **ID**: `01`
  - **Fields**: `name`, `surname1`, `surname2`, `street`, `portal`, `zip`, `province`
  - **Field Types**: `text`, `text`, `text`, `text`, `portal`, `preserve`, `preserve`
  - **Example Data**: `['John', 'Doe', '', 'Main St', '123', '28080', 'Madrid']`

### Field Types and Normalization

Each field type is normalized according to specific rules before generating the hash:

- **phone**:

  - Removes non-numeric characters.
  - Adds country code if missing (default is Spain, `0034`).
  - If the phone number starts with `+`, it is replaced with `00`.

- **text**:

  - Converts to lowercase.
  - Removes accents and special characters.
  - Removes any non-alphabetical character.

- **email**:

  - Converts to lowercase.
  - Removes invalid characters.
  - Maintains standard email characters.

- **identity**:

  - Converts letters to lowercase.
  - Removes invalid characters.
  - Keeps numbers and specific lowercase letters.

- **portal**:

  - Extracts the numeric part.
  - Special handling for 'sn' (without number).

- **preserve**:
  - No normalization is applied.

## Testing from the Terminal

1. **Add your API credentials** in the `.env` file as shown in the configuration section.

2. **Use the `example.js` file** to test the library with different channels and data.

3. **Run the test script** from the terminal:

   ```bash
   npm run example
   ```

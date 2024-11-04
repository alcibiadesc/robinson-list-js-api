# Lista Robinson API - JavaScript Client Library

This JavaScript library simplifies making authenticated requests to the Lista Robinson API using AWS Signature Version 4. It handles the complexities of generating the necessary authentication headers, signing requests, normalizing input data, and generating the required hashes, allowing developers to easily integrate with the Lista Robinson service.

Based on:

- [https://www.listarobinson.es/](https://www.listarobinson.es/)
- [https://github.com/adigital-org/slr-client](https://github.com/adigital-org/slr-client)

## Table of Contents

- [Lista Robinson API - JavaScript Client Library](#lista-robinson-api---javascript-client-library)
  - [Table of Contents](#table-of-contents)
  - [What Does the API Do?](#what-does-the-api-do)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Usage Example](#usage-example)
    - [Available Channels and Required Fields](#available-channels-and-required-fields)
    - [Field Types and Normalization](#field-types-and-normalization)

## What Does the API Do?

- **Support for All Channels**: Integrates with all available channels provided by the Lista Robinson client-server.
- **Automatic Data Normalization**: Normalizes input data according to the service rules before generating the hash.
- **Hash Generation**: Generates the required SHA-256 hashes.
- **AWS Signature Version 4 Authentication**: Handles request signing according to AWS Signature Version 4 using crypto.js.

## Installation

1. **Clone the repository** and navigate to the project directory:

   ```bash
   git clone https://github.com/alcibiadesc/robinson-list-js-api.git
   cd robinson-list-js-api
   ```

2. **Install the dependencies**:

   ```bash
   npm install
   ```

## Usage

Here is an example of how to use the main function `sendListaRobinsonRequest` to make a request to the API.

Replace `YOUR_ACCESS_KEY` and `YOUR_SECRET_KEY` with your actual Lista Robinson Credentials

### Usage Example

```javascript
// example.js

import { sendListaRobinsonRequest } from "robinson-list-js-api";

// Retrieve credentials and configuration from environment variables
const accessKey = "YOUR_ACCESS_KEY";
const secretKey = "YOUR_SECRET_KEY";
const region = "eu-west-1";
const service = "execute-api";
const endpoint = "https://api.listarobinson.es/v1/api/user";

// Data for the request
const channel = "PhoneSimple"; // One of the available channels
const data = ["636238940"]; // Fields corresponding to the channel

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
    console.log("API Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

**Note:** It is recommended to use **environment variables** to store sensitive information such as access keys, secret keys, and endpoint URLs. This ensures that sensitive data is not hardcoded in your source code, reducing security risks and allowing better flexibility across different environments (development, staging, production).

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

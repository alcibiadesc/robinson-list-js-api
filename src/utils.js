// utils.js

import { channels, mixedRecord } from "./channels.js";
import { normalizers, defaultCountryCode } from "./normalizers.js";

let crypto;

// Function to load the appropriate `crypto` module based on the environment
async function loadCrypto() {
  if (typeof window !== "undefined" && window.crypto) {
    // Browser environment: use crypto-browserify
    crypto = await import("crypto-browserify");
  } else {
    // Node.js environment: use native crypto
    crypto = await import("crypto");
  }
}

// Call `loadCrypto` to ensure `crypto` is loaded before using it
await loadCrypto();

/**
 * Checks if the given record matches the expected structure for
 * the given channel and performs minor fixes if needed.
 * On error, returns null.
 */
export const sanitize = (fields, channel) => {
  const sanFields = [...fields];

  // With mixed input, get record's channel and drop it from sanitized fields.
  const sanChannel = channel === mixedRecord ? sanFields.shift() : channel;

  // Channel check
  if (!channels.hasOwnProperty(sanChannel)) {
    console.warn(`Unknown channel type "${sanChannel}" for record:`, fields);
    return null;
  }

  const expectedFieldsLength = channels[sanChannel].fields.length;

  // Reject records with wrong fields number (malformed records)
  if (sanFields.length !== expectedFieldsLength) {
    console.warn("Malformed record:", fields);
    return null;
  }

  return { channel: sanChannel, fields: sanFields };
};

/**
 * Transforms a full record to a hash that can be sent to the SLR API.
 * Applies the normalizers to each field, and hashes the result as per the spec.
 * Expects as input an object with the record values: channel and fields.
 */
export const recordToHash = (recordValues) => {
  try {
    const { channel, fields } = recordValues;
    const { id, types } = channels[channel];
    // Process each field with the corresponding channel rules.
    const filtered = fields
      .map((val, i) => normalizers[types[i]](val))
      .join("");
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

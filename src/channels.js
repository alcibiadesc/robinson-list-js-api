/**
 * This module defines all available channels for the Lista Robinson API,
 * including their IDs, required fields, field types, and other relevant information.
 */

/**
 * A catalog of all available channels, with their IDs, fields, types, etc.
 * This list is used to determine which fields and normalizers should be applied
 * depending on the channel.
 */
export const channels = {
  PhoneSimple: {
    id: "04",
    fields: ["phone"],
    types: ["phone"],
    fileType: "Phones",
    campaign: "Calls",
  },
  SmsSimple: {
    id: "03",
    fields: ["phone"],
    types: ["phone"],
    fileType: "Phones",
    campaign: "Sms",
  },
  PhoneFull: {
    id: "04",
    fields: ["name", "surname1", "surname2", "phone"],
    types: ["text", "text", "text", "phone"],
    fileType: "NameAndPhones",
    campaign: "Calls",
  },
  SmsFull: {
    id: "03",
    fields: ["name", "surname1", "surname2", "phone"],
    types: ["text", "text", "text", "phone"],
    fileType: "NameAndPhones",
    campaign: "Sms",
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
      "province",
    ],
    types: ["text", "text", "text", "text", "portal", "preserve", "preserve"],
    fileType: "Postal",
    campaign: "Postal",
  },
  Email: {
    id: "02",
    fields: ["email"],
    types: ["email"],
    fileType: "Email",
    campaign: "Email",
  },
  DNI_NIF_NIE: {
    id: "00",
    fields: ["dni"],
    types: ["identity"],
    fileType: "DNI_NIF_NIE",
    campaign: "DNI_NIF_NIE",
  },
};

/**
 * A keyword for mixed input file.
 * This is used when the input file contains records for multiple channels.
 */
export const mixedRecord = "Mixed";

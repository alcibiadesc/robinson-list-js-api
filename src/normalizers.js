/**
 * This module provides functions to normalize input data according to the service rules.
 * Each field type has a corresponding normalizer function.
 */

export const defaultCountryCode = "0034"; // Spain country code

const textSrc = "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÇÈÉÌÍÑÒÓÙÚÜàáçèéìíñòóùúü".split(
  ""
);
const textDst = "abcdefghijklmnopqrstuvwxyzaaceeiinoouuuaaceeiinoouuu".split(
  ""
);
const emailSrc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const emailDst = "abcdefghijklmnopqrstuvwxyz".split("");
const textRegexp = /[^a-z]/g;
const emailRegexp = /[^a-z0-9.@_\-+]/g;
const numberRegexp = /[^0-9]/g;
const portalRegexp = /[0-9]*/;
const identitySrc = "0123456789ABCDEFGHJKLMNPQRSTVWXYZ".split("");
const identityDst = "0123456789abcdefghjklmnpqrstvwxyz".split("");
const identityRegex = /[^0-9abcdefghjklmnpqrstvwxyz]/g;

/**
 * Translates characters from source to destination mapping.
 */
const translate = (src, dst, value) =>
  value
    .split("")
    .map((c) => {
      const idx = src.indexOf(c);
      return idx !== -1 ? dst[idx] : c;
    })
    .join("");

/**
 * The collection of normalization functions, keyed by field type.
 * Each field type has a corresponding function which takes a value,
 * and returns the value normalized according to the service rules.
 */
export const normalizers = {
  phone: (n) => {
    const normalized = n.replace(numberRegexp, "");
    if (n.startsWith("+")) return "00" + normalized;
    if (n.startsWith("00")) return normalized;
    return defaultCountryCode + normalized;
  },
  text: (n) => translate(textSrc, textDst, n).replace(textRegexp, ""),
  email: (n) => translate(emailSrc, emailDst, n).replace(emailRegexp, ""),
  portal: (n) => (n === "sn" ? "sn" : n.match(portalRegexp).toString()),
  identity: (n) =>
    translate(identitySrc, identityDst, n).replace(identityRegex, ""),
  preserve: (n) => n,
};

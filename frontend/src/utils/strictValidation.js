/**
 * Strict client-side validation for admin forms.
 * Trims edges; blocks obvious HTML/script/SQL injection patterns on text fields.
 */

const DANGEROUS =
  /[<>]|javascript:|on\w+\s*=|\bscript\b|(\b(union|select|insert|drop|delete|alter|create|truncate|exec|execute)\b)|;--|\/\*|\*\//i;

export function trimValue(value) {
  return String(value ?? '').trim();
}

export function hasDangerousContent(value) {
  if (value == null || value === '') return false;
  return DANGEROUS.test(String(value));
}

/** Letters + spaces only (Unicode letters). Collapses internal whitespace for validation. */
export function lettersAndSpacesOnly(fieldLabel, raw, { required = true } = {}) {
  const collapsed = trimValue(raw).replace(/\s+/g, ' ');
  if (!collapsed) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!/^[\p{L}]+(\s[\p{L}]+)*$/u.test(collapsed)) {
    return `${fieldLabel} may only contain letters and spaces`;
  }
  if (hasDangerousContent(collapsed)) {
    return `${fieldLabel} contains invalid characters`;
  }
  return null;
}

/** Letters, numbers, and spaces only (for class names like "Grade 10"). */
export function alphanumericWithSpaces(fieldLabel, raw, { required = true } = {}) {
  const collapsed = trimValue(raw).replace(/\s+/g, ' ');
  if (!collapsed) {
    return required ? `${fieldLabel} is required` : null;
  }
  // Allow letters, numbers, and spaces (Unicode letters + digits)
  if (!/^[\p{L}\d]+(\s[\p{L}\d]+)*$/u.test(collapsed)) {
    return `${fieldLabel} may only contain letters, numbers, and spaces`;
  }
  if (hasDangerousContent(collapsed)) {
    return `${fieldLabel} contains invalid characters`;
  }
  return null;
}

/** Positive integer string (digits only), optional or required. */
export function digitsOnlyUnsignedInt(fieldLabel, raw, { required = true, min = 1, max = null, allowZero = false } = {}) {
  const v = trimValue(raw);
  if (!v) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!/^\d+$/.test(v)) {
    return `${fieldLabel} must be digits only (no letters, symbols, or spaces)`;
  }
  const n = Number(v);
  const lower = allowZero ? 0 : min;
  if (n < lower) {
    return `${fieldLabel} must be at least ${lower}`;
  }
  if (max != null && n > max) {
    return `${fieldLabel} must be at most ${max}`;
  }
  return null;
}

/** Class section: single letter A–D only. */
export function classSectionABCD(fieldLabel, raw) {
  const t = trimValue(raw).toUpperCase();
  if (!t) {
    return `${fieldLabel} is required`;
  }
  if (t.length !== 1 || !/^[ABCD]$/.test(t)) {
    return `${fieldLabel} must be a single letter A, B, C, or D`;
  }
  return null;
}

/** Student / teacher custom ID: letters + digits, no spaces or symbols. */
export function alphanumericId(fieldLabel, raw, { required = false } = {}) {
  const t = trimValue(raw);
  if (!t) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!/^[A-Za-z0-9]+$/.test(t)) {
    return `${fieldLabel} may only contain letters and numbers (no spaces or symbols)`;
  }
  if (hasDangerousContent(t)) {
    return `${fieldLabel} contains invalid characters`;
  }
  return null;
}

/** Subject code: A–Z and 0–9 only, no spaces (normalized to uppercase for display). */
export function subjectCodeStrict(fieldLabel, raw, { required = true } = {}) {
  const t = trimValue(raw).toUpperCase();
  if (!t) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!/^[A-Z0-9]+$/.test(t)) {
    return `${fieldLabel} may only contain letters and digits (no spaces or symbols)`;
  }
  return null;
}

export function optionalEmail(fieldLabel, raw) {
  const t = trimValue(raw);
  if (!t) return null;
  if (hasDangerousContent(t)) {
    return `${fieldLabel} contains invalid characters`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
    return `${fieldLabel} must be a valid email address`;
  }
  return null;
}

export function requiredEmail(fieldLabel, raw) {
  const t = trimValue(raw);
  if (!t) {
    return `${fieldLabel} is required`;
  }
  return optionalEmail(fieldLabel, t);
}

/** Optional phone: digits and optional leading + when non-empty. */
export function optionalPhoneDigits(fieldLabel, raw) {
  const t = trimValue(raw);
  if (!t) return null;
  if (!/^\+?\d+$/.test(t)) {
    return `${fieldLabel} must contain digits and an optional leading + only`;
  }
  return null;
}

export function passwordField(fieldLabel, raw, { required = true, minLength = 6 } = {}) {
  const t = String(raw ?? '');
  if (!trimValue(t)) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (/[<>]/.test(t)) {
    return `${fieldLabel} cannot contain angle brackets`;
  }
  if (hasDangerousContent(t)) {
    return `${fieldLabel} contains invalid characters`;
  }
  if (t.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters`;
  }
  return null;
}

/** Remarks: letters, numbers, spaces, period, comma only; no HTML. */
export function remarksStrict(fieldLabel, raw, { required = false, maxLen = 500 } = {}) {
  const t = trimValue(raw);
  if (!t) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (t.length > maxLen) {
    return `${fieldLabel} must be at most ${maxLen} characters`;
  }
  if (hasDangerousContent(t)) {
    return `${fieldLabel} contains invalid characters`;
  }
  if (!/^[\p{L}\p{N}\s.,]+$/u.test(t)) {
    return `${fieldLabel} may only contain letters, numbers, spaces, commas, and periods`;
  }
  return null;
}

/** Marks: digits only; 0..maxMarks. */
export function marksScore(fieldLabel, raw, maxMarks, { required = true } = {}) {
  const v = trimValue(String(raw));
  if (!v) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!/^\d+$/.test(v)) {
    return `${fieldLabel} must be digits only`;
  }
  const n = Number(v);
  if (n > maxMarks) {
    return `${fieldLabel} cannot exceed ${maxMarks}`;
  }
  return null;
}

/** School / address line: letters, numbers, common punctuation; no brackets. */
export function safeAddressLine(fieldLabel, raw, { required = false, maxLen = 200 } = {}) {
  const t = trimValue(raw);
  if (!t) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (t.length > maxLen) {
    return `${fieldLabel} is too long`;
  }
  if (hasDangerousContent(t)) {
    return `${fieldLabel} contains invalid characters`;
  }
  if (!/^[\p{L}\p{N}\s.,\-#/]+$/u.test(t)) {
    return `${fieldLabel} contains invalid characters`;
  }
  return null;
}

/** EVC / merchant: digits only when set. */
export function optionalMerchantDigits(fieldLabel, raw) {
  return optionalPhoneDigits(fieldLabel, raw);
}

export function cnInputError(error) {
  return error
    ? 'ring-2 ring-red-500 border border-red-500 dark:ring-red-500'
    : 'border-none focus:ring-2 focus:ring-primary';
}

export function filterDigitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/** Keep only digits and + for phone numbers while typing. */
export function numbersOnly(value) {
  return String(value ?? '').replace(/[^0-9+]/g, '');
}

export function filterAlphanumericId(value) {
  return String(value ?? '').replace(/[^A-Za-z0-9]/g, '');
}

/** Keep only letters and spaces (Unicode) while typing — strips digits/symbols. */
export function filterLettersAndSpaces(value) {
  return String(value ?? '')
    .replace(/[^\p{L}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

/** Keep only letters, numbers, and spaces (Unicode) while typing — for class names like "Grade 10". */
export function filterAlphanumericWithSpaces(value) {
  return String(value ?? '')
    .replace(/[^\p{L}\d\s]/gu, '')
    .replace(/\s+/g, ' ');
}

/** Subject code while typing: A–Z, 0–9 only. */
export function filterSubjectCode(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function normalizeName(value) {
  return trimValue(value).replace(/\s+/g, ' ');
}

export function normalizeSection(value) {
  return trimValue(value).toUpperCase().slice(0, 1);
}

/**
 * Extracts a 2-letter prefix from a school name.
 * If multiple words, takes the first letter of the first two words.
 * If one word, takes the first two letters.
 */
export function getSchoolPrefix(schoolName) {
  if (!schoolName) return 'SC';
  const words = String(schoolName).trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return String(schoolName).substring(0, 2).toUpperCase();
}

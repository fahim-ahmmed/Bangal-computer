/**
 * Product specs are freeform key-value pairs typed by an admin (Part 3/7's
 * "add spec row" form), so a field like "CPU socket" might be saved as
 * "Socket", "Socket Type", or "CPU Socket". These helpers read specs
 * tolerantly instead of assuming one exact key name.
 */

/** Returns the value of the first spec key that contains any of the given aliases (case-insensitive). */
export function findSpec(specs, aliases) {
  if (!specs) return null;
  const entries = Object.entries(specs);
  for (const alias of aliases) {
    const hit = entries.find(([k]) => k.toLowerCase().includes(alias.toLowerCase()));
    if (hit) return hit[1];
  }
  return null;
}

/** Pulls the first integer out of a spec string, e.g. "650W 80+ Bronze" → 650. */
export function firstNumber(str) {
  if (!str) return null;
  const m = String(str).match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

/** True if the spec value's text loosely matches (substring, case-insensitive). */
export function specIncludes(value, needle) {
  return Boolean(value) && String(value).toLowerCase().includes(needle.toLowerCase());
}

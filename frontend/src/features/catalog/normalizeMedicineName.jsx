export function normalizeMedicineName(name) {
  return name
    .toLowerCase()
    .replace(/\d+mg|\d+ ml|\d+mcg/gi, "") // remove dosage
    .replace(/tablet|capsule|syrup|injection/gi, "") // remove forms
    .trim();
}

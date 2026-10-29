// Search text is matched literally, so a crafted pattern can't hang the
// database (ReDoS) or match more than the user typed.
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { escapeRegex };

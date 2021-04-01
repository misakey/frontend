
// Decode a base64 string into a Uint8Array.
export default (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

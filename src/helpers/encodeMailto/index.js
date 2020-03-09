
export default (mailto, subject, body) => `mailto:${encodeURIComponent(mailto)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

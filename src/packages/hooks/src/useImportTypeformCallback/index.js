import { useCallback } from 'react';

// Data from typeform
const TYPEFORM_SCRIPT_ID = 'typef_orm_share';
export const TYPEFORM_EMBED_URL = 'https://embed.typeform.com/embed.js';

export default () => useCallback(
  (event) => {
    const { target } = event;
    if (!document.querySelector(`script[src="${TYPEFORM_EMBED_URL}"]`)) {
      event.preventDefault();
      const typeformScript = document.createElement('script');
      typeformScript.id = TYPEFORM_SCRIPT_ID;
      typeformScript.src = TYPEFORM_EMBED_URL;
      typeformScript.onload = () => target.click();
      typeformScript.onerror = () => target.click();
      const q = document.getElementsByTagName('script')[0];
      q.parentNode.insertBefore(typeformScript, q);
    }
  },
  [],
);

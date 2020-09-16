import { useEffect } from 'react';

import isEmpty from '@misakey/helpers/isEmpty';

const DEFAULT_TITLE = 'Misakey';

/**
 * This function has no effect on SEO but just improves UX.
 * @param title
 * @param description
 */
function updateHead(title, description) {
  if (!isEmpty(title) && title !== DEFAULT_TITLE) { document.title = `${title} - Misakey`; }
  if (!isEmpty(description)) { document.description = description; }

  return () => {
    document.title = DEFAULT_TITLE;
    document.description = '';
  };
}

export default (title, description) => {
  useEffect(() => updateHead(title, description), [description, title]);
};

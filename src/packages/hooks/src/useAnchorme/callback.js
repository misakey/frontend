import React, { useCallback } from 'react';

import anchorme from '@misakey/helpers/anchorme';
import isEmpty from '@misakey/helpers/isEmpty';
import head from '@misakey/helpers/head';

// HELPERS
const hasProtocol = (str) => /^https?:\/\//.test(str);
const hasMailto = (str) => /^mailto:/.test(str);

const makeHref = (href, defaultProtocol) => {
  if (hasProtocol(href)) {
    return href;
  }
  return `${defaultProtocol}${href}`;
};

const makeMailto = (mail) => {
  if (hasMailto(mail)) {
    return mail;
  }
  return `mailto:${mail}`;
};

// HOOKS
export default ({ extensions = [], defaultProtocol = 'https://', LinkComponent = 'a', linkProps = {} }) => useCallback(
  (input) => {
    let extendedInput = input;
    if (!isEmpty(extensions)) {
      extensions.forEach((ext) => {
        extendedInput = extendedInput.replace(ext.test, ext.transform);
      });
    }
    const matches = anchorme.list(extendedInput);

    const elements = [];
    let lastIndex = 0;

    matches.forEach(({ start, end, string, isURL = false, isEmail = false }) => {
      if (start > lastIndex) {
        elements.push(extendedInput.substring(lastIndex, start));
      }
      const key = `${start}-${end}`;
      if (isURL) {
        elements.push(
          <LinkComponent
            key={key}
            href={makeHref(string, defaultProtocol)}
            {...linkProps}
          >
            {string}
          </LinkComponent>,
        );
      } else if (isEmail) {
        elements.push(
          <LinkComponent
            key={key}
            href={makeMailto(string)}
            {...linkProps}
          >
            {string}
          </LinkComponent>,
        );
      } else {
        elements.push(string);
      }
      lastIndex = end;
    });


    if (lastIndex < extendedInput.length) {
      elements.push(extendedInput.substring(lastIndex));
    }

    if (elements.length === 0) {
      return extendedInput;
    }
    if (elements.length === 1) {
      return head(elements);
    }
    return elements;
  },
  // @FIXME LinkComponent is needed in deps, even if linter complains
  /* eslint-disable react-hooks/exhaustive-deps */
  [
    extensions,
    defaultProtocol,
    linkProps,
    LinkComponent,
  ],
);

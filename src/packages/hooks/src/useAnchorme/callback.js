import React, { useCallback } from 'react';

import anchorme from '@misakey/helpers/anchorme';
import isEmpty from '@misakey/helpers/isEmpty';
import head from '@misakey/helpers/head';

import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';


import { Link } from 'react-router-dom';

// HELPERS
const hasProtocol = (str) => /^https?:\/\//.test(str);
const hasMailto = (str) => /^mailto:/.test(str);
const isLocalUrl = (str) => {
  const { hostname } = new URL(str);
  return hostname === window.location.hostname;
};

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
        const href = makeHref(string, defaultProtocol);

        if (isLocalUrl(href)) {
          const { pathname } = parseUrlFromLocation(href);

          elements.push(
            <LinkComponent
              key={key}
              to={pathname}
              component={Link}
              {...linkProps}
            >
              {string}
            </LinkComponent>,
          );
        } else {
          elements.push(
            <LinkComponent
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...linkProps}
            >
              {string}
            </LinkComponent>,
          );
        }
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
